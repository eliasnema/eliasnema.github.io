import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  boundaryCodeForTerritory,
  buildBoundaryIndex,
  capitalDisplayName,
  validateCatalogue,
} from "../js/domain.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(scriptDirectory, "..");
const catalogue = validateCatalogue(JSON.parse(await readFile(join(appDirectory, "data/territories.json"), "utf8")));
const boundaries = JSON.parse(await readFile(join(appDirectory, "data/country-boundaries.geojson"), "utf8"));
const boundaryIndex = buildBoundaryIndex(boundaries);
const fallbackNames = catalogue
  .filter((territory) => {
    const code = boundaryCodeForTerritory(territory);
    return !code || !(boundaryIndex.get(code)?.length);
  })
  .map((territory) => territory.name)
  .sort();
const expectedFallbacks = [
  "Ascension Island",
  "Canary Islands",
  "Diego Garcia",
  "European Union",
  "Gibraltar",
  "Tristan Da Cunha",
  "United Nations",
].sort();

if (JSON.stringify(fallbackNames) !== JSON.stringify(expectedFallbacks)) {
  throw new Error(`Boundary fallback list drifted: ${fallbackNames.join(", ")}`);
}
const withBoundaries = catalogue.length - fallbackNames.length;
if (withBoundaries !== 247) throw new Error(`Expected 247 boundary-backed territories; found ${withBoundaries}.`);
const factCount = catalogue.filter((territory) => (territory.flagFacts ?? []).length === 2).length;
const capitalCount = catalogue.filter((territory) => capitalDisplayName(territory)).length;

console.log(`Validated ${catalogue.length} territories, ${capitalCount} capitals, ${factCount} fact pairs, and ${withBoundaries} boundary matches.`);
