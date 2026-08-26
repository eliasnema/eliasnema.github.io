import { configurationKey } from "./domain.js";

export const STORAGE_KEY = "flaguiz.userData.v1";

export function emptyUserData() {
  return {
    version: 1,
    scores: {},
    gameStarts: {},
    correctGuesses: {},
    incorrectGuesses: {},
    mistakeDetails: [],
  };
}

function safeCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function safeRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, count]) => [key, safeCount(count)]));
}

export function parseStoredUserData(raw) {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
    throw new Error("Unsupported saved-progress version.");
  }
  const mistakes = Array.isArray(parsed.mistakeDetails)
    ? parsed.mistakeDetails
      .filter((item) => item
        && typeof item.correctTerritoryName === "string"
        && typeof item.incorrectTerritoryName === "string"
        && item.correctTerritoryName
        && item.incorrectTerritoryName)
      .map((item) => ({
        correctTerritoryName: item.correctTerritoryName,
        incorrectTerritoryName: item.incorrectTerritoryName,
        count: safeCount(item.count),
      }))
    : [];
  return {
    version: 1,
    scores: safeRecord(parsed.scores),
    gameStarts: safeRecord(parsed.gameStarts),
    correctGuesses: safeRecord(parsed.correctGuesses),
    incorrectGuesses: safeRecord(parsed.incorrectGuesses),
    mistakeDetails: mistakes,
  };
}

export class UserDataStore {
  constructor(storage) {
    this.storage = storage;
    let storageAccessFailed = false;
    if (storage === undefined) {
      try {
        this.storage = globalThis.localStorage;
      } catch {
        this.storage = null;
        storageAccessFailed = true;
      }
    }
    this.data = emptyUserData();
    this.persistent = true;
    this.warning = null;
    this.listeners = new Set();
    this.load();
    if (storageAccessFailed) {
      this.persistent = false;
      this.warning = "Progress will not be saved in this browser.";
    }
    if (globalThis.addEventListener) {
      globalThis.addEventListener("storage", (event) => {
        if (event.key !== STORAGE_KEY || typeof event.newValue !== "string") return;
        try {
          this.data = parseStoredUserData(event.newValue);
          this.emit("external");
        } catch {
          // Another tab's invalid document must not replace the current safe state.
        }
      });
    }
  }

  load() {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (raw) this.data = parseStoredUserData(raw);
    } catch {
      this.persistent = false;
      this.warning = "Saved progress could not be loaded. Starting a fresh session.";
      this.data = emptyUserData();
    }
  }

  snapshot() {
    return structuredClone(this.data);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(reason = "local") {
    for (const listener of this.listeners) listener(this.snapshot(), reason);
  }

  persist() {
    if (!this.persistent) return;
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      this.persistent = false;
      this.warning = "Progress will not be saved in this browser.";
    }
  }

  mutate(mutator) {
    mutator(this.data);
    this.persist();
    this.emit();
  }

  configKey(mode, scope) {
    return configurationKey(mode, scope);
  }

  best(mode, scope) {
    return safeCount(this.data.scores[this.configKey(mode, scope)]);
  }

  plays(mode, scope) {
    return safeCount(this.data.gameStarts[this.configKey(mode, scope)]);
  }

  recordGameStart(mode, scope) {
    const key = this.configKey(mode, scope);
    this.mutate((data) => {
      data.gameStarts[key] = safeCount(data.gameStarts[key]) + 1;
    });
  }

  recordCorrect(mode, scope) {
    const key = this.configKey(mode, scope);
    this.mutate((data) => {
      data.correctGuesses[key] = safeCount(data.correctGuesses[key]) + 1;
    });
  }

  recordIncorrect(mode, scope, correctTerritoryName, incorrectTerritoryName) {
    const key = this.configKey(mode, scope);
    this.mutate((data) => {
      data.incorrectGuesses[key] = safeCount(data.incorrectGuesses[key]) + 1;
      const existing = data.mistakeDetails.find((item) => item.correctTerritoryName === correctTerritoryName
        && item.incorrectTerritoryName === incorrectTerritoryName);
      if (existing) existing.count = safeCount(existing.count) + 1;
      else data.mistakeDetails.push({ correctTerritoryName, incorrectTerritoryName, count: 1 });
    });
  }

  commitBest(mode, scope, candidate) {
    const key = this.configKey(mode, scope);
    const score = safeCount(candidate);
    const previous = safeCount(this.data.scores[key]);
    if (score <= previous) return previous;
    this.mutate((data) => {
      data.scores[key] = score;
    });
    return score;
  }

  previousMistakeNames() {
    return [...new Set(this.data.mistakeDetails.map((item) => item.correctTerritoryName))];
  }
}

export function createUserDataStore(storage) {
  return new UserDataStore(storage);
}
