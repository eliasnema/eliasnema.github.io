import test from "node:test";
import assert from "node:assert/strict";
import { UserDataStore, parseStoredUserData } from "../js/store.js";
import { MODE_DEFINITIONS, SCOPE_DEFINITIONS } from "../js/domain.js";

class MemoryStorage {
  constructor() { this.value = null; }
  getItem() { return this.value; }
  setItem(_key, value) { this.value = value; }
}

test("store persists isolated configuration counters, bests, and aggregated confusions", () => {
  const storage = new MemoryStorage();
  const mode = MODE_DEFINITIONS[1];
  const europe = SCOPE_DEFINITIONS.find((scope) => scope.id === "europe");
  const asia = SCOPE_DEFINITIONS.find((scope) => scope.id === "asia");
  const store = new UserDataStore(storage);
  store.recordGameStart(mode, europe);
  store.recordCorrect(mode, europe);
  store.recordIncorrect(mode, europe, "France", "Germany");
  store.recordIncorrect(mode, europe, "France", "Germany");
  store.commitBest(mode, europe, 8);
  store.commitBest(mode, europe, 5);
  assert.equal(store.best(mode, europe), 8);
  assert.equal(store.best(mode, asia), 0);
  assert.equal(store.snapshot().mistakeDetails[0].count, 2);

  const reloaded = new UserDataStore(storage);
  assert.equal(reloaded.best(mode, europe), 8);
  assert.equal(reloaded.plays(mode, europe), 1);
});

test("future or corrupt storage is rejected instead of reinterpreted", () => {
  assert.throws(() => parseStoredUserData("not-json"));
  assert.throws(() => parseStoredUserData({ version: 2 }));
});

test("blocked storage falls back to in-memory progress without rejecting mutations", () => {
  const storage = {
    getItem() { throw new DOMException("blocked", "SecurityError"); },
    setItem() { throw new DOMException("blocked", "SecurityError"); },
  };
  const mode = MODE_DEFINITIONS[0];
  const scope = SCOPE_DEFINITIONS[0];
  const store = new UserDataStore(storage);
  assert.equal(store.persistent, false);
  assert.doesNotThrow(() => store.recordCorrect(mode, scope));
  assert.equal(store.snapshot().correctGuesses[store.configKey(mode, scope)], 1);
});
