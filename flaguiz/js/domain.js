export const MODE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "countryToFlag",
    slug: "map-to-flags",
    title: "Map to Flags",
    shortTitle: "Flags",
    subtitle: "Choose the flag for each map location",
    prompt: "Explore the location, then choose the matching flag",
    completionMessage: "You matched every location to its flag.",
    tint: "green",
    icon: "⚑",
  }),
  Object.freeze({
    id: "flagToCountry",
    slug: "flags-to-countries",
    title: "Flags to Countries",
    shortTitle: "Countries",
    subtitle: "Choose the country for each flag",
    prompt: "Use the flag and map, then choose the matching country",
    completionMessage: "You matched every flag to its country in this round.",
    tint: "orange",
    icon: "文",
  }),
  Object.freeze({
    id: "countryToCapital",
    slug: "capital-cities",
    title: "Capital Cities",
    shortTitle: "Capitals",
    subtitle: "Choose each country's capital city",
    prompt: "Use the country and map, then choose the matching capital city",
    completionMessage: "You matched every country to its capital city.",
    tint: "teal",
    icon: "⌂",
  }),
]);

export const SCOPE_DEFINITIONS = Object.freeze([
  Object.freeze({ id: "all", title: "All Continents", continent: null, storageID: "all", span: 55 }),
  Object.freeze({ id: "africa", title: "Africa", continent: "africa", storageID: "continent:africa", span: 45 }),
  Object.freeze({ id: "asia", title: "Asia", continent: "asia", storageID: "continent:asia", span: 40 }),
  Object.freeze({ id: "europe", title: "Europe", continent: "europe", storageID: "continent:europe", span: 37 }),
  Object.freeze({ id: "north-america", title: "North America", continent: "northAmerica", storageID: "continent:northAmerica", span: 47 }),
  Object.freeze({ id: "oceania", title: "Oceania", continent: "oceania", storageID: "continent:oceania", span: 48 }),
  Object.freeze({ id: "south-america", title: "South America", continent: "southAmerica", storageID: "continent:southAmerica", span: 40 }),
  Object.freeze({ id: "antarctica", title: "Antarctica 😉", continent: "antarctica", storageID: "continent:antarctica", span: 75 }),
]);

export const CONTINENT_TITLES = Object.freeze({
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  northAmerica: "North America",
  oceania: "Oceania",
  southAmerica: "South America",
  antarctica: "Antarctica",
});

const MODE_BY_ID = new Map(MODE_DEFINITIONS.map((mode) => [mode.id, mode]));
const MODE_BY_SLUG = new Map(MODE_DEFINITIONS.map((mode) => [mode.slug, mode]));
const SCOPE_BY_ID = new Map(SCOPE_DEFINITIONS.map((scope) => [scope.id, scope]));

export function modeFromSlug(slug) {
  return MODE_BY_SLUG.get(slug) ?? null;
}

export function modeFromID(id) {
  return MODE_BY_ID.get(id) ?? null;
}

export function scopeFromSlug(slug) {
  return SCOPE_BY_ID.get(slug) ?? null;
}

export function configurationKey(modeOrID, scopeOrID) {
  const mode = typeof modeOrID === "string" ? MODE_BY_ID.get(modeOrID) : modeOrID;
  const scope = typeof scopeOrID === "string" ? SCOPE_BY_ID.get(scopeOrID) : scopeOrID;
  if (!mode || !scope) throw new Error("Invalid game configuration");
  return `mode:${mode.id}|scope:${scope.storageID}`;
}

export function capitalDisplayName(territory) {
  const capitals = territory.capitalCities ?? [];
  if (capitals.length === 0) return null;
  if (capitals.length === 1) return capitals[0];
  if (capitals.length === 2) return `${capitals[0]} and ${capitals[1]}`;
  return `${capitals.slice(0, -1).join(", ")}, and ${capitals.at(-1)}`;
}

export function eligibleTerritories(catalogue, modeOrID, scopeOrID) {
  const mode = typeof modeOrID === "string" ? MODE_BY_ID.get(modeOrID) : modeOrID;
  const scope = typeof scopeOrID === "string" ? SCOPE_BY_ID.get(scopeOrID) : scopeOrID;
  if (!mode || !scope) return [];
  const scoped = scope.id === "all"
    ? [...catalogue]
    : catalogue.filter((territory) => territory.continent === scope.continent);
  return mode.id === "countryToCapital"
    ? scoped.filter((territory) => capitalDisplayName(territory) !== null)
    : scoped;
}

export function playableScopes(catalogue, modeOrID) {
  return SCOPE_DEFINITIONS.filter((scope) => eligibleTerritories(catalogue, modeOrID, scope).length > 0);
}

export function validateCatalogue(catalogue) {
  if (!Array.isArray(catalogue)) throw new Error("The territory catalogue is not an array.");
  if (catalogue.length !== 254) throw new Error(`Expected 254 territories; found ${catalogue.length}.`);
  const knownContinents = new Set(Object.keys(CONTINENT_TITLES));
  const ids = new Set();
  for (const territory of catalogue) {
    if (!territory || typeof territory !== "object") throw new Error("A territory entry is invalid.");
    if (typeof territory.id !== "string" || !territory.id) throw new Error("A territory has no stable id.");
    if (ids.has(territory.id)) throw new Error(`Duplicate territory id: ${territory.id}.`);
    ids.add(territory.id);
    if (typeof territory.name !== "string" || !territory.name) throw new Error(`Territory ${territory.id} has no name.`);
    if (typeof territory.symbol !== "string" || !territory.symbol) throw new Error(`Territory ${territory.id} has no flag symbol.`);
    if (!Number.isFinite(territory.centerLatitude) || territory.centerLatitude < -90 || territory.centerLatitude > 90) {
      throw new Error(`Territory ${territory.id} has an invalid latitude.`);
    }
    if (!Number.isFinite(territory.centerLongitude) || territory.centerLongitude < -180 || territory.centerLongitude > 180) {
      throw new Error(`Territory ${territory.id} has an invalid longitude.`);
    }
    if (territory.continent != null && !knownContinents.has(territory.continent)) {
      throw new Error(`Territory ${territory.id} has an unknown continent.`);
    }
    if (!Number.isInteger(territory.rank)) throw new Error(`Territory ${territory.id} has an invalid rank.`);
    for (const value of territory.capitalCities ?? []) {
      if (typeof value !== "string" || !value) throw new Error(`Territory ${territory.id} has an empty capital.`);
    }
    for (const value of territory.flagFacts ?? []) {
      if (typeof value !== "string" || !value) throw new Error(`Territory ${territory.id} has an empty fact.`);
    }
  }
  const capitalCount = catalogue.filter((territory) => capitalDisplayName(territory) !== null).length;
  const factEntries = catalogue.filter((territory) => (territory.flagFacts ?? []).length > 0);
  if (capitalCount !== 250) throw new Error(`Expected 250 capital-ready territories; found ${capitalCount}.`);
  if (factEntries.length !== 188 || factEntries.some((territory) => territory.flagFacts.length !== 2)) {
    throw new Error("Flag-fact inventory does not match the reviewed catalogue.");
  }
  const expected = {
    countryToFlag: [254, 63, 53, 54, 36, 27, 19, 1],
    flagToCountry: [254, 63, 53, 54, 36, 27, 19, 1],
    countryToCapital: [250, 63, 52, 53, 36, 27, 19, 0],
  };
  for (const mode of MODE_DEFINITIONS) {
    const actual = SCOPE_DEFINITIONS.map((scope) => eligibleTerritories(catalogue, mode, scope).length);
    if (actual.some((value, index) => value !== expected[mode.id][index])) {
      throw new Error(`Eligibility counts drifted for ${mode.title}.`);
    }
  }
  return Object.freeze(catalogue.map((territory) => Object.freeze({ ...territory })));
}

export function secureRandomInt(upperExclusive) {
  if (!Number.isSafeInteger(upperExclusive) || upperExclusive <= 0) throw new RangeError("upperExclusive must be positive");
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * upperExclusive);
  const range = 0x1_0000_0000;
  const limit = range - (range % upperExclusive);
  const values = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(values); while (values[0] >= limit);
  return values[0] % upperExclusive;
}

export function fisherYates(values, randomInt = secureRandomInt) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function normalized(value, locale) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase(locale);
}

export function moveUniqueCapitalChoicesToFront(ids, territoryByID) {
  const choiceCount = Math.min(4, ids.length);
  const seen = new Set();
  const front = [];
  const rest = [];
  for (const id of ids) {
    const territory = territoryByID.get(id);
    const key = normalized(capitalDisplayName(territory) ?? territory.name);
    if (front.length < choiceCount && !seen.has(key)) {
      front.push(id);
      seen.add(key);
    } else {
      rest.push(id);
    }
  }
  return [...front, ...rest];
}

function uniqueAppend(values, value) {
  return values.includes(value) ? values : [...values, value];
}

export function createRound(catalogue, mode, scope, options = {}) {
  const randomInt = options.randomInt ?? secureRandomInt;
  const territoryByID = options.territoryByID ?? new Map(catalogue.map((territory) => [territory.id, territory]));
  let remainingTerritoryIDs = fisherYates(
    eligibleTerritories(catalogue, mode, scope).map((territory) => territory.id),
    randomInt,
  );
  if (remainingTerritoryIDs.length === 0) throw new Error("This configuration has no playable territories.");
  if (mode.id === "countryToCapital") {
    remainingTerritoryIDs = moveUniqueCapitalChoicesToFront(remainingTerritoryIDs, territoryByID);
  }
  return {
    instanceID: options.instanceID ?? `${Date.now()}-${secureRandomInt(1_000_000)}`,
    modeID: mode.id,
    scopeID: scope.id,
    phase: "awaitingAnswer",
    remainingTerritoryIDs,
    correctChoiceIndex: randomInt(Math.min(4, remainingTerritoryIDs.length)),
    selectedChoiceIndex: null,
    score: 0,
    bestAtRoundStart: options.bestAtRoundStart ?? 0,
    lives: 3,
    feedbackText: null,
    completedTerritoryIDs: [],
    unresolvedMissIDs: [],
    everMissedIDs: [],
    previousMistakeNamesAtStart: [...(options.previousMistakeNamesAtStart ?? [])],
    clearedPreviousMistakeNames: [],
    pendingSummary: null,
    lastAnswerCorrect: null,
  };
}

export function visibleChoiceIDs(round) {
  return round.remainingTerritoryIDs.slice(0, 4);
}

export function targetTerritoryID(round) {
  return visibleChoiceIDs(round)[round.correctChoiceIndex] ?? null;
}

export function feedbackCopy(mode, target, chosen, correct) {
  if (correct) {
    if (mode.id === "countryToFlag") return "Correct flag";
    if (mode.id === "flagToCountry") return `Correct: ${target.name}`;
    return `Correct: ${capitalDisplayName(target)}`;
  }
  if (mode.id === "countryToFlag") return "That flag is not the match";
  if (mode.id === "flagToCountry") return `${chosen.name} is not ${target.name}`;
  return `${capitalDisplayName(chosen)} is not the capital of ${target.name}`;
}

export function submitRoundAnswer(round, index, catalogue) {
  if (round.phase !== "awaitingAnswer") return { accepted: false, state: round };
  const choices = visibleChoiceIDs(round);
  if (!Number.isInteger(index) || index < 0 || index >= choices.length) return { accepted: false, state: round };
  const territoryByID = new Map(catalogue.map((territory) => [territory.id, territory]));
  const mode = modeFromID(round.modeID);
  const targetID = choices[round.correctChoiceIndex];
  const chosenID = choices[index];
  const target = territoryByID.get(targetID);
  const chosen = territoryByID.get(chosenID);
  const correct = index === round.correctChoiceIndex;
  let state = {
    ...round,
    phase: "feedbackLocked",
    selectedChoiceIndex: index,
    feedbackText: feedbackCopy(mode, target, chosen, correct),
    lastAnswerCorrect: correct,
  };
  if (correct) {
    state = {
      ...state,
      score: round.score + 1,
      completedTerritoryIDs: uniqueAppend(round.completedTerritoryIDs, targetID),
      unresolvedMissIDs: round.unresolvedMissIDs.filter((id) => id !== targetID),
      clearedPreviousMistakeNames: round.previousMistakeNamesAtStart.includes(target.name)
        ? uniqueAppend(round.clearedPreviousMistakeNames, target.name)
        : round.clearedPreviousMistakeNames,
    };
  } else {
    state = {
      ...state,
      lives: round.lives - 1,
      unresolvedMissIDs: uniqueAppend(round.unresolvedMissIDs, targetID),
      everMissedIDs: uniqueAppend(round.everMissedIDs, targetID),
    };
  }
  const terminal = correct && round.remainingTerritoryIDs.length === 1
    ? "complete"
    : (!correct && state.lives === 0 ? "failed" : null);
  return { accepted: true, correct, targetID, chosenID, terminal, state };
}

export function advanceRound(round, catalogue, randomInt = secureRandomInt) {
  if (round.phase !== "feedbackLocked" || round.lastAnswerCorrect === null) return round;
  const territoryByID = new Map(catalogue.map((territory) => [territory.id, territory]));
  const targetID = targetTerritoryID(round);
  let ids = round.lastAnswerCorrect
    ? round.remainingTerritoryIDs.filter((id) => id !== targetID)
    : [...round.remainingTerritoryIDs];
  ids = fisherYates(ids, randomInt);
  if (round.modeID === "countryToCapital") ids = moveUniqueCapitalChoicesToFront(ids, territoryByID);
  return {
    ...round,
    phase: "awaitingAnswer",
    remainingTerritoryIDs: ids,
    correctChoiceIndex: randomInt(Math.min(4, ids.length)),
    selectedChoiceIndex: null,
    feedbackText: null,
    lastAnswerCorrect: null,
  };
}

export function buildRoundSummary(round, catalogue, terminal, storedBest) {
  const territoryByID = new Map(catalogue.map((territory) => [territory.id, territory]));
  const bySimpleName = (left, right) => {
    const a = territoryByID.get(left).name;
    const b = territoryByID.get(right).name;
    return a < b ? -1 : a > b ? 1 : 0;
  };
  const best = Math.max(storedBest, round.score);
  return Object.freeze({
    terminal,
    score: round.score,
    best,
    isNewBest: round.score > round.bestAtRoundStart,
    correctIDs: [...round.completedTerritoryIDs].sort(bySimpleName),
    incorrectIDs: [...round.everMissedIDs].sort(bySimpleName),
  });
}

export function searchTerritories(catalogue, rawQuery, selectedTerritory = null, locale) {
  const trimmed = String(rawQuery).trim();
  if (!trimmed || selectedTerritory?.name === trimmed) return [];
  const query = normalized(trimmed, locale);
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  return catalogue
    .map((territory) => {
      const name = normalized(territory.name, locale);
      let score = null;
      if (name === query) score = 0;
      else if (name.startsWith(query)) score = 1;
      else if (name.split(" ").some((word) => word.startsWith(query))) score = 2;
      else if (name.includes(query)) score = 3;
      return score === null ? null : { territory, score };
    })
    .filter(Boolean)
    .sort((left, right) => left.score - right.score
      || left.territory.rank - right.territory.rank
      || collator.compare(left.territory.name, right.territory.name))
    .slice(0, 8)
    .map((entry) => entry.territory);
}

function recordValue(record, key) {
  const value = Number(record?.[key] ?? 0);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function progressForConfiguration(catalogue, data, mode, scope) {
  const total = eligibleTerritories(catalogue, mode, scope).length;
  if (!total) return 1;
  return recordValue(data.scores, configurationKey(mode, scope)) / total;
}

export function recommendedScope(catalogue, data, mode) {
  const scopes = playableScopes(catalogue, mode);
  const attemptedIncomplete = scopes.slice(1).filter((scope) => {
    const key = configurationKey(mode, scope);
    return recordValue(data.gameStarts, key) > 0 && progressForConfiguration(catalogue, data, mode, scope) < 1;
  });
  if (!attemptedIncomplete.length) return scopes[0];
  return attemptedIncomplete.reduce((weakest, scope) => (
    progressForConfiguration(catalogue, data, mode, scope) < progressForConfiguration(catalogue, data, mode, weakest)
      ? scope
      : weakest
  ));
}

export function createStatisticsSuggestions(catalogue, data, randomInt = secureRandomInt) {
  return MODE_DEFINITIONS.map((mode) => {
    const regions = playableScopes(catalogue, mode).filter((scope) => scope.id !== "all");
    const attemptedIncomplete = regions.filter((scope) => {
      const key = configurationKey(mode, scope);
      return recordValue(data.gameStarts, key) > 0 && progressForConfiguration(catalogue, data, mode, scope) < 1;
    });
    if (attemptedIncomplete.length) {
      const scope = attemptedIncomplete.reduce((weakest, candidate) => (
        progressForConfiguration(catalogue, data, mode, candidate) < progressForConfiguration(catalogue, data, mode, weakest)
          ? candidate
          : weakest
      ));
      return { mode, scope, label: "Weakest region", progress: progressForConfiguration(catalogue, data, mode, scope), weak: true };
    }
    const scope = regions[randomInt(regions.length)];
    return { mode, scope, label: "Suggested region", progress: progressForConfiguration(catalogue, data, mode, scope), weak: false };
  });
}

export function practiceSuggestion(suggestions) {
  const weak = suggestions.filter((suggestion) => suggestion.weak);
  const candidates = weak.length ? weak : suggestions;
  return candidates.reduce((best, candidate) => candidate.progress < best.progress ? candidate : best, candidates[0]);
}

export function aggregateStatistics(catalogue, data) {
  const allKeys = MODE_DEFINITIONS.flatMap((mode) => playableScopes(catalogue, mode).map((scope) => ({ mode, scope, key: configurationKey(mode, scope) })));
  const games = allKeys.reduce((sum, item) => sum + recordValue(data.gameStarts, item.key), 0);
  const correct = allKeys.reduce((sum, item) => sum + recordValue(data.correctGuesses, item.key), 0);
  const incorrect = allKeys.reduce((sum, item) => sum + recordValue(data.incorrectGuesses, item.key), 0);
  const accuracy = correct + incorrect > 0 ? Math.round((100 * correct) / (correct + incorrect)) : null;
  const modes = MODE_DEFINITIONS.map((mode) => {
    const modeKeys = allKeys.filter((item) => item.mode.id === mode.id);
    const modeGames = modeKeys.reduce((sum, item) => sum + recordValue(data.gameStarts, item.key), 0);
    const modeCorrect = modeKeys.reduce((sum, item) => sum + recordValue(data.correctGuesses, item.key), 0);
    const modeIncorrect = modeKeys.reduce((sum, item) => sum + recordValue(data.incorrectGuesses, item.key), 0);
    return {
      mode,
      games: modeGames,
      correct: modeCorrect,
      incorrect: modeIncorrect,
      accuracy: modeCorrect + modeIncorrect > 0 ? Math.round((100 * modeCorrect) / (modeCorrect + modeIncorrect)) : null,
      best: Math.max(0, ...modeKeys.map((item) => recordValue(data.scores, item.key))),
    };
  });
  return { games, correct, incorrect, accuracy, modes };
}

export function boundaryCodeForTerritory(territory) {
  const scalars = Array.from(territory.symbol);
  if (scalars.length === 2) {
    const values = scalars.map((scalar) => scalar.codePointAt(0));
    if (values.every((value) => value >= 0x1f1e6 && value <= 0x1f1ff)) {
      return String.fromCharCode(...values.map((value) => 65 + value - 0x1f1e6));
    }
  }
  return { england: "ENG", scotland: "SCT", wales: "WLS" }[territory.id] ?? null;
}

export function buildBoundaryIndex(featureCollection) {
  const index = new Map();
  for (const feature of featureCollection?.features ?? []) {
    const codes = feature?.properties?.boundary_codes ?? [];
    for (const code of codes) {
      const current = index.get(code) ?? [];
      current.push(feature);
      index.set(code, current);
    }
  }
  return index;
}

export function boundaryForTerritory(territory, boundaryIndex) {
  const code = boundaryCodeForTerritory(territory);
  const features = code ? boundaryIndex.get(code) ?? [] : [];
  return { type: "FeatureCollection", features };
}

export function boundsForFeatureCollection(featureCollection) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  const visit = (coordinates) => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
      west = Math.min(west, coordinates[0]);
      east = Math.max(east, coordinates[0]);
      south = Math.min(south, coordinates[1]);
      north = Math.max(north, coordinates[1]);
      return;
    }
    coordinates.forEach(visit);
  };
  for (const feature of featureCollection?.features ?? []) visit(feature.geometry?.coordinates);
  return Number.isFinite(west) ? [west, south, east, north] : null;
}
