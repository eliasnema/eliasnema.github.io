import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  MODE_DEFINITIONS,
  SCOPE_DEFINITIONS,
  advanceRound,
  boundaryCodeForTerritory,
  capitalDisplayName,
  createRound,
  createStatisticsSuggestions,
  eligibleTerritories,
  modeFromID,
  moveUniqueCapitalChoicesToFront,
  recommendedScope,
  searchTerritories,
  submitRoundAnswer,
  validateCatalogue,
} from "../js/domain.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const catalogue = validateCatalogue(JSON.parse(await readFile(join(testDirectory, "../data/territories.json"), "utf8")));
const territoryByID = new Map(catalogue.map((territory) => [territory.id, territory]));

test("catalogue counts match every mode and scope", () => {
  const expected = {
    countryToFlag: [254, 63, 53, 54, 36, 27, 19, 1],
    flagToCountry: [254, 63, 53, 54, 36, 27, 19, 1],
    countryToCapital: [250, 63, 52, 53, 36, 27, 19, 0],
  };
  for (const mode of MODE_DEFINITIONS) {
    assert.deepEqual(SCOPE_DEFINITIONS.map((scope) => eligibleTerritories(catalogue, mode, scope).length), expected[mode.id]);
  }
});

test("capital display preserves one, two, and three-capital grammar", () => {
  assert.equal(capitalDisplayName({ capitalCities: ["A"] }), "A");
  assert.equal(capitalDisplayName({ capitalCities: ["A", "B"] }), "A and B");
  assert.equal(capitalDisplayName({ capitalCities: ["A", "B", "C"] }), "A, B, and C");
});

test("capital choice preparation keeps four visible strings unique", () => {
  const fixture = [
    { id: "a", name: "A", capitalCities: ["London"] },
    { id: "b", name: "B", capitalCities: ["London"] },
    { id: "c", name: "C", capitalCities: ["Paris"] },
    { id: "d", name: "D", capitalCities: ["Rome"] },
    { id: "e", name: "E", capitalCities: ["Berlin"] },
  ];
  const byID = new Map(fixture.map((territory) => [territory.id, territory]));
  const prepared = moveUniqueCapitalChoicesToFront(fixture.map((territory) => territory.id), byID);
  const values = prepared.slice(0, 4).map((id) => capitalDisplayName(byID.get(id)));
  assert.equal(new Set(values).size, 4);
});

test("correct and wrong transactions lock immediately and advance with specified pool behavior", () => {
  const fixture = catalogue.slice(0, 5);
  const mode = modeFromID("countryToFlag");
  const scope = SCOPE_DEFINITIONS[0];
  let round = createRound(fixture, mode, scope, { randomInt: () => 0, territoryByID: new Map(fixture.map((item) => [item.id, item])) });
  const target = round.remainingTerritoryIDs[round.correctChoiceIndex];
  const correct = submitRoundAnswer(round, round.correctChoiceIndex, fixture);
  assert.equal(correct.accepted, true);
  assert.equal(correct.state.phase, "feedbackLocked");
  assert.equal(correct.state.score, 1);
  assert.equal(submitRoundAnswer(correct.state, round.correctChoiceIndex, fixture).accepted, false);
  round = advanceRound(correct.state, fixture, () => 0);
  assert.equal(round.remainingTerritoryIDs.includes(target), false);

  const wrongIndex = round.correctChoiceIndex === 0 ? 1 : 0;
  const wrongTarget = round.remainingTerritoryIDs[round.correctChoiceIndex];
  const wrong = submitRoundAnswer(round, wrongIndex, fixture);
  assert.equal(wrong.state.lives, 2);
  assert.equal(wrong.state.unresolvedMissIDs.includes(wrongTarget), true);
  round = advanceRound(wrong.state, fixture, () => 0);
  assert.equal(round.remainingTerritoryIDs.includes(wrongTarget), true);
});

test("search folds accents and ranks exact, prefix, word prefix, then substring", () => {
  assert.equal(searchTerritories(catalogue, "cote")[0].name, "Côte d’Ivoire");
  assert.equal(searchTerritories(catalogue, "REUNION")[0].name, "Réunion");
  const rankedFixture = [
    { id: "uae", name: "United Arab Emirates", rank: 47 },
    { id: "uk", name: "United Kingdom", rank: 9 },
    { id: "us", name: "United States", rank: 3 },
  ];
  assert.deepEqual(searchTerritories(rankedFixture, "united").map((item) => item.name), [
    "United States",
    "United Kingdom",
    "United Arab Emirates",
  ]);
  assert.deepEqual(searchTerritories(catalogue, "   "), []);
});

test("recommendations preserve fresh All and weakest attempted region rules", () => {
  const mode = modeFromID("countryToFlag");
  const empty = { scores: {}, gameStarts: {}, correctGuesses: {}, incorrectGuesses: {}, mistakeDetails: [] };
  assert.equal(recommendedScope(catalogue, empty, mode).id, "all");
  const europe = SCOPE_DEFINITIONS.find((scope) => scope.id === "europe");
  const asia = SCOPE_DEFINITIONS.find((scope) => scope.id === "asia");
  const data = structuredClone(empty);
  const europeKey = `mode:${mode.id}|scope:${europe.storageID}`;
  const asiaKey = `mode:${mode.id}|scope:${asia.storageID}`;
  data.gameStarts[europeKey] = 1;
  data.gameStarts[asiaKey] = 1;
  data.scores[europeKey] = 22;
  data.scores[asiaKey] = 10;
  assert.equal(recommendedScope(catalogue, data, mode).id, "asia");
  const suggestions = createStatisticsSuggestions(catalogue, data, () => 0);
  assert.equal(suggestions[0].scope.id, "asia");
  assert.equal(suggestions[0].label, "Weakest region");
});

test("flag and subdivision symbols derive canonical boundary codes", () => {
  assert.equal(boundaryCodeForTerritory(territoryByID.get("brazil")), "BR");
  assert.equal(boundaryCodeForTerritory(territoryByID.get("japan")), "JP");
  assert.equal(boundaryCodeForTerritory(territoryByID.get("united-states-of-america")), "US");
  assert.equal(boundaryCodeForTerritory(territoryByID.get("england")), "ENG");
  assert.equal(boundaryCodeForTerritory(territoryByID.get("scotland")), "SCT");
  assert.equal(boundaryCodeForTerritory(territoryByID.get("wales")), "WLS");
});
