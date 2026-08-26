import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  MODE_DEFINITIONS,
  playableScopes,
  validateCatalogue,
} from "../js/domain.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(scriptDirectory, "..");
const shell = await readFile(join(appDirectory, "index.html"), "utf8");
const catalogue = validateCatalogue(JSON.parse(await readFile(join(appDirectory, "data/territories.json"), "utf8")));

const routes = ["explore", "statistics", "acknowledgements"];
for (const mode of MODE_DEFINITIONS) {
  routes.push(`setup/${mode.slug}`);
  for (const scope of playableScopes(catalogue, mode)) routes.push(`play/${mode.slug}/${scope.id}`);
}

for (const route of routes) {
  const directory = join(appDirectory, route);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), shell);
}

console.log(`Generated ${routes.length} static route entries.`);
