import {
  CONTINENT_TITLES,
  MODE_DEFINITIONS,
  SCOPE_DEFINITIONS,
  advanceRound,
  aggregateStatistics,
  buildRoundSummary,
  capitalDisplayName,
  configurationKey,
  createRound,
  createStatisticsSuggestions,
  eligibleTerritories,
  fisherYates,
  modeFromSlug,
  playableScopes,
  practiceSuggestion,
  recommendedScope,
  scopeFromSlug,
  searchTerritories,
  submitRoundAnswer,
  targetTerritoryID,
  validateCatalogue,
  visibleChoiceIDs,
} from "./domain.js";
import { createUserDataStore } from "./store.js";
import { FlaguizMap } from "./map.js";

const APP_BASE = new URL(document.baseURI).pathname.replace(/\/?$/, "/");
const IOS_APP_URL = "https://apps.apple.com/us/app/flagiuz-flags-capitals/id1641015368";
const appRoot = document.querySelector("#app");
const bootStatus = document.querySelector("#boot-status");

let catalogue = [];
let territoryByID = new Map();
let territoryByName = new Map();
let store = null;
let activeMap = null;
let activeRouteCleanup = [];
let currentRoute = null;
let currentGame = null;
let currentStatisticsSuggestions = null;
let globalAnnouncement = null;

function element(tag, options = {}, ...children) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.id) node.id = options.id;
  if (options.text !== undefined) node.textContent = String(options.text);
  if (options.hidden) node.hidden = true;
  if (options.type) node.type = options.type;
  if (options.value !== undefined) node.value = options.value;
  if (options.placeholder) node.placeholder = options.placeholder;
  if (options.tabIndex !== undefined) node.tabIndex = options.tabIndex;
  if (options.href) node.setAttribute("href", options.href);
  if (options.title) node.title = options.title;
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (value !== null && value !== undefined && value !== false) node.setAttribute(name, value === true ? "" : String(value));
  }
  for (const [event, listener] of Object.entries(options.on ?? {})) node.addEventListener(event, listener);
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function icon(value, className = "") {
  return element("span", { className: `icon ${className}`.trim(), text: value, attrs: { "aria-hidden": "true" } });
}

function routeURL(path) {
  const suffix = path === "/" ? "" : path.replace(/^\//, "");
  return `${APP_BASE}${suffix}`;
}

function currentAppPath() {
  const pathname = globalThis.location.pathname;
  if (!pathname.startsWith(APP_BASE)) return "/";
  const suffix = pathname.slice(APP_BASE.length).replace(/^\/+|\/+$/g, "");
  return suffix ? `/${suffix}/` : "/";
}

function appLink(path, className, ...children) {
  return element("a", {
    className,
    href: routeURL(path),
    on: {
      click: (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(path);
      },
    },
  }, ...children);
}

function gameLink(path, className, ...children) {
  return element("a", {
    className,
    href: routeURL(path),
    on: {
      click: (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(path, { origin: currentAppPath() });
      },
    },
  }, ...children);
}

function announce(message, assertive = false) {
  if (!globalAnnouncement) return;
  globalAnnouncement.setAttribute("aria-live", assertive ? "assertive" : "polite");
  globalAnnouncement.textContent = "";
  requestAnimationFrame(() => {
    if (globalAnnouncement) globalAnnouncement.textContent = message;
  });
}

function pageFrame(className, ...children) {
  const frame = element("div", { className: `app-frame ${className}` }, ...children);
  const warning = store?.warning
    ? element("div", { className: "global-warning glass", attrs: { role: "status" } }, icon("!"), element("span", { text: store.warning }))
    : null;
  globalAnnouncement = element("div", { className: "visually-hidden", attrs: { "aria-live": "polite", "aria-atomic": "true" } });
  appRoot.replaceChildren(...[frame, warning, globalAnnouncement].filter(Boolean));
  return frame;
}

function focusRouteHeading(frame) {
  requestAnimationFrame(() => frame.querySelector("h1[tabindex='-1']")?.focus({ preventScroll: true }));
}

function parseRoute(path = currentAppPath()) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home", path: "/" };
  if (parts.length === 1 && parts[0] === "explore") return { name: "explore", path };
  if (parts.length === 1 && parts[0] === "statistics") return { name: "statistics", path };
  if (parts.length === 1 && parts[0] === "acknowledgements") return { name: "acknowledgements", path };
  if (parts.length === 2 && parts[0] === "setup") return { name: "setup", mode: modeFromSlug(parts[1]), path };
  if (parts.length === 3 && parts[0] === "play") {
    return { name: "game", mode: modeFromSlug(parts[1]), scope: scopeFromSlug(parts[2]), path };
  }
  return { name: "unavailable", path };
}

function navigate(path, options = {}) {
  const currentDepth = Number(history.state?.flaguizDepth ?? 0);
  const state = {
    flaguiz: true,
    flaguizDepth: options.replace ? currentDepth : currentDepth + 1,
    origin: options.origin ?? null,
  };
  if (options.replace) history.replaceState(state, "", routeURL(path));
  else history.pushState(state, "", routeURL(path));
  renderRoute();
}

function goBackOrHome() {
  if (Number(history.state?.flaguizDepth ?? 0) > 0) history.back();
  else navigate("/", { replace: true });
}

function visibleBackButton(label = "Back") {
  return element("button", {
    className: "round-icon-button back-button",
    type: "button",
    attrs: { "aria-label": label },
    on: { click: goBackOrHome },
  }, icon("‹"));
}

function statisticsButton() {
  return appLink("/statistics/", "round-icon-button statistics-button", icon("▥"), element("span", { className: "visually-hidden", text: "View Statistics" }));
}

function cleanupRoute() {
  if (currentGame) {
    clearTimeout(currentGame.timerID);
    currentGame.timerID = null;
    store?.commitBest(currentGame.mode, currentGame.scope, currentGame.round.score);
    globalThis.speechSynthesis?.cancel?.();
    currentGame = null;
  }
  activeMap?.destroy();
  activeMap = null;
  for (const cleanup of activeRouteCleanup.splice(0)) cleanup();
  currentStatisticsSuggestions = null;
}

function mountMap(host, options, configure) {
  const canvas = element("div", { className: "map-canvas" });
  const failure = element("div", { className: "map-failure glass", hidden: true, attrs: { role: "alert" } },
    icon("!"),
    element("strong", { text: "Map unavailable" }),
    element("span", { text: "The game is still ready. Try the map again when you are connected." }),
  );
  const retry = element("button", { className: "secondary-button", type: "button", text: "Retry" });
  failure.append(retry);
  host.append(canvas, failure);

  const start = () => {
    failure.hidden = true;
    host.classList.remove("has-map-failure");
    activeMap?.destroy();
    canvas.replaceChildren();
    const map = new FlaguizMap({
      ...options,
      container: canvas,
      catalogue,
      onFailure: () => {
        failure.hidden = false;
        host.classList.add("has-map-failure");
        announce("Map unavailable", true);
      },
    });
    activeMap = map;
    configure?.(map);
  };
  retry.addEventListener("click", start);
  start();
  return () => activeMap;
}

function modeCard(mode) {
  return appLink(`/setup/${mode.slug}/`, `menu-card glass tint-${mode.tint}`,
    element("span", { className: "menu-card__icon" }, icon(mode.icon)),
    element("span", { className: "menu-card__body" },
      element("span", { className: "eyebrow", text: "Game mode" }),
      element("strong", { className: "menu-card__title", text: mode.title }),
      element("span", { className: "menu-card__detail", text: mode.subtitle }),
    ),
    icon("›", "disclosure"),
  );
}

function renderHome() {
  document.title = "Flaguiz — Learn countries and their flags";
  const mapSurface = element("div", { className: "map-surface map-surface--backdrop", attrs: { "aria-hidden": "true" } });
  const veil = element("div", { className: "map-veil" });
  const heading = element("h1", { className: "wordmark", text: "Flaguiz", tabIndex: -1 });
  const header = element("header", { className: "menu-header" }, heading, statisticsButton());
  const chosenFlags = fisherYates(catalogue).slice(0, 30);
  const ribbons = element("div", { className: "flag-ribbons", attrs: { "aria-hidden": "true" } },
    ...[0, 1, 2].map((row) => element("div", { className: `flag-ribbon flag-ribbon--${row + 1}` },
      ...chosenFlags.slice(row * 10, row * 10 + 10).map((territory) => element("span", { text: territory.symbol })),
    )),
  );
  const cue = element("section", { className: "cue-panel glass" },
    element("strong", { text: "Game modes" }),
    element("span", { text: "Pick a challenge or explore freely" }),
  );
  const explorerCard = appLink("/explore/", "menu-card glass tint-blue",
    element("span", { className: "menu-card__icon" }, icon("◎")),
    element("span", { className: "menu-card__body" },
      element("span", { className: "eyebrow", text: "Explore" }),
      element("strong", { className: "menu-card__title", text: "Globe Map" }),
      element("span", { className: "menu-card__detail", text: `${catalogue.length} flags` }),
    ),
    icon("›", "disclosure"),
  );
  const footer = element("footer", { className: "menu-footer" },
    element("a", { href: "/", text: "Elias Nema" }),
    element("span", { attrs: { "aria-hidden": "true" }, text: "·" }),
    element("a", { href: IOS_APP_URL, text: "iOS game" }),
    element("span", { attrs: { "aria-hidden": "true" }, text: "·" }),
    appLink("/acknowledgements/", "", "Map & accessibility notes"),
  );
  const main = element("main", { className: "menu-scroll" }, header, ribbons, cue, ...MODE_DEFINITIONS.map(modeCard), explorerCard, footer);
  const frame = pageFrame("route-home map-route", mapSurface, veil, main);
  mountMap(mapSurface, { interactive: false, presentation: "hybrid", center: [8, 18], zoom: 0.65 }, (map) => map.focusWholeEarth([8, 18]));
  focusRouteHeading(frame);
}

function scopeRow(mode, scope, eyebrow, recommended = false) {
  const total = eligibleTerritories(catalogue, mode, scope).length;
  const best = store.best(mode, scope);
  const played = store.plays(mode, scope);
  const path = `/play/${mode.slug}/${scope.id}/`;
  return gameLink(path, `scope-row glass ${recommended ? "scope-row--recommended" : ""}`,
    element("span", { className: "scope-row__icon" }, icon(recommended ? "◎" : scope.id === "all" ? "◉" : "○")),
    element("span", { className: "scope-row__body" },
      element("span", { className: "eyebrow", text: eyebrow }),
      element("strong", { text: scope.title }),
      element("span", { text: `${best}/${total} best - ${played} played` }),
    ),
    icon("›", "disclosure"),
  );
}

function renderSetup(route) {
  if (!route.mode) return renderUnavailable("That game mode is unavailable.");
  const mode = route.mode;
  document.title = `${mode.title} — Flaguiz`;
  const mapSurface = element("div", { className: "map-surface map-surface--backdrop", attrs: { "aria-hidden": "true" } });
  const veil = element("div", { className: "map-veil" });
  const heading = element("h1", { text: mode.title, tabIndex: -1 });
  const nav = element("nav", { className: "route-nav", attrs: { "aria-label": "Game setup" } }, visibleBackButton(), statisticsButton());
  const headerCard = element("section", { className: `setup-hero glass tint-${mode.tint}` },
    element("span", { className: "setup-hero__icon" }, icon(mode.icon)),
    element("div", {},
      element("span", { className: "eyebrow", text: "Game mode" }),
      heading,
      element("p", { text: mode.subtitle }),
    ),
  );
  const recommended = recommendedScope(catalogue, store.snapshot(), mode);
  const scopeList = playableScopes(catalogue, mode);
  const main = element("main", { className: "setup-scroll" },
    nav,
    headerCard,
    scopeRow(mode, recommended, "Recommended", true),
    element("h2", { className: "section-label", text: "Practice scope" }),
    ...scopeList.map((scope) => scopeRow(mode, scope, scope.id === "all" ? "Full set" : "Region")),
    element("footer", { className: "menu-footer" }, appLink("/acknowledgements/", "", "Map & accessibility notes")),
  );
  const frame = pageFrame("route-setup map-route", mapSurface, veil, main);
  mountMap(mapSurface, { interactive: false, presentation: "hybrid", center: [8, 18], zoom: 0.65 }, (map) => map.focusWholeEarth([8, 18]));
  focusRouteHeading(frame);
}

function renderUnavailable(message = "This Flaguiz page is unavailable.") {
  document.title = "Unavailable — Flaguiz";
  const heading = element("h1", { text: "Not available", tabIndex: -1 });
  const main = element("main", { className: "simple-page" },
    appLink("/", "text-back-link", "‹ Home"),
    element("section", { className: "simple-card" }, icon("!"), heading, element("p", { text: message }), appLink("/", "primary-button", "Back to Flaguiz")),
  );
  const frame = pageFrame("route-simple", main);
  focusRouteHeading(frame);
}

function speechAvailable() {
  return Boolean(globalThis.speechSynthesis && globalThis.SpeechSynthesisUtterance);
}

function speakCountryName(name) {
  if (!speechAvailable()) return;
  globalThis.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(name);
  const voices = globalThis.speechSynthesis.getVoices?.() ?? [];
  utterance.voice = voices.find((voice) => voice.lang?.toLowerCase() === "en-us")
    ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith("en"))
    ?? null;
  utterance.lang = "en-US";
  utterance.rate = 0.75;
  utterance.pitch = 1;
  utterance.volume = 1;
  globalThis.speechSynthesis.speak(utterance);
}

function resultMarkerModels(game) {
  return [
    ...game.round.completedTerritoryIDs.map((id) => ({ territory: territoryByID.get(id), kind: "completed", showsTitle: false })),
    ...game.round.unresolvedMissIDs.map((id) => ({ territory: territoryByID.get(id), kind: "missed", showsTitle: false })),
  ];
}

function updateGameMap(game, first = false) {
  const target = territoryByID.get(targetTerritoryID(game.round));
  const map = game.map ?? game.getMap?.();
  if (!target || !map) return;
  map.showGameTarget(target, game.mode, game.scope, resultMarkerModels(game), first);
}

function gameChoiceText(game, territory) {
  if (game.mode.id === "countryToFlag") return territory.symbol;
  if (game.mode.id === "flagToCountry") return territory.name;
  return capitalDisplayName(territory);
}

function renderGamePrompt(game) {
  const target = territoryByID.get(targetTerritoryID(game.round));
  if (!target) return;
  const prompt = game.elements.prompt;
  const feedback = game.round.feedbackText;
  const instruction = element("p", {
    className: `prompt-instruction ${feedback ? (game.round.lastAnswerCorrect ? "is-correct" : "is-incorrect") : ""}`,
    text: feedback ?? game.mode.prompt,
  });
  const value = element("div", { className: `prompt-value prompt-value--${game.mode.id}` });
  if (game.mode.id === "flagToCountry") {
    value.append(element("span", { className: "prompt-flag prompt-flag--large", text: target.symbol, attrs: { "aria-label": `Flag of ${target.name}` } }));
  } else {
    if (game.mode.id === "countryToCapital") {
      value.append(element("span", { className: "prompt-flag", text: target.symbol, attrs: { "aria-hidden": "true" } }));
    }
    value.append(element("strong", { text: target.name }));
    if (speechAvailable()) {
      value.append(element("button", {
        className: "speaker-button",
        type: "button",
        attrs: { "aria-label": `Pronounce ${target.name}` },
        on: { click: () => speakCountryName(target.name) },
      }, icon("◖")));
    }
  }
  prompt.replaceChildren(
    instruction,
    value,
    element("p", { className: "map-instruction", text: "Drag, pinch, and rotate the map" }),
  );
}

function renderGameChoices(game, focusIndex = null) {
  const choiceIDs = visibleChoiceIDs(game.round);
  const locked = game.round.phase !== "awaitingAnswer";
  const choices = game.elements.choices;
  choices.className = `answer-grid answer-grid--${game.mode.id}`;
  const nodes = [];
  for (let index = 0; index < 4; index += 1) {
    const id = choiceIDs[index];
    if (!id) {
      nodes.push(element("span", { className: "answer-card answer-card--placeholder", attrs: { "aria-hidden": "true" } }));
      continue;
    }
    const territory = territoryByID.get(id);
    const isCorrect = locked && index === game.round.correctChoiceIndex;
    const isSelected = locked && index === game.round.selectedChoiceIndex;
    const isWrong = isSelected && !isCorrect;
    const classNames = [
      "answer-card",
      game.mode.id === "countryToFlag" ? "answer-card--flag" : "answer-card--text",
      isCorrect ? "is-correct" : "",
      isWrong ? "is-incorrect" : "",
    ].filter(Boolean).join(" ");
    const accessibleName = game.mode.id === "countryToFlag"
      ? `Flag option ${index + 1}${isCorrect ? ", correct answer" : isWrong ? ", selected, incorrect" : ""}`
      : `${gameChoiceText(game, territory)}${isCorrect ? ", correct answer" : isWrong ? ", selected, incorrect" : ""}`;
    const button = element("button", {
      className: classNames,
      type: "button",
      attrs: {
        "aria-label": accessibleName,
        "aria-pressed": isSelected ? "true" : "false",
        disabled: locked,
      },
      on: { click: () => submitGameChoice(game, index) },
    },
    element("span", { className: "answer-card__value", text: gameChoiceText(game, territory), attrs: { "aria-hidden": game.mode.id === "countryToFlag" ? "true" : null } }),
    isCorrect ? element("span", { className: "answer-card__state", text: "✓" }) : null,
    isWrong ? element("span", { className: "answer-card__state", text: "×" }) : null,
    );
    nodes.push(button);
  }
  choices.replaceChildren(...nodes);
  if (focusIndex !== null) requestAnimationFrame(() => choices.querySelectorAll("button")[focusIndex]?.focus());
}

function updateGameStatus(game) {
  const completed = game.round.completedTerritoryIDs.length;
  const total = eligibleTerritories(catalogue, game.mode, game.scope).length;
  game.elements.modeScope.textContent = `${game.mode.shortTitle} - ${game.scope.title}`;
  game.elements.progress.textContent = `${completed}/${total} found`;
  game.elements.progress.classList.toggle("is-complete", completed === total);
  const hearts = [0, 1, 2].map((index) => index < game.round.lives ? "♥" : "♡").join(" ");
  game.elements.lives.textContent = hearts;
  game.elements.lives.setAttribute("aria-label", `${game.round.lives} ${game.round.lives === 1 ? "life" : "lives"} remaining`);
}

function updateGameHUD(game, options = {}) {
  if (game !== currentGame) return;
  updateGameStatus(game);
  renderGamePrompt(game);
  renderGameChoices(game, options.focusIndex ?? null);
}

function submitGameChoice(game, index) {
  if (game !== currentGame) return;
  const result = submitRoundAnswer(game.round, index, catalogue);
  if (!result.accepted) return;
  game.round = result.state;
  const target = territoryByID.get(result.targetID);
  const chosen = territoryByID.get(result.chosenID);
  if (result.correct) store.recordCorrect(game.mode, game.scope);
  else store.recordIncorrect(game.mode, game.scope, target.name, chosen.name);
  updateGameHUD(game);
  updateGameMap(game, false);
  announce(game.round.feedbackText);

  if (result.terminal) {
    const best = store.commitBest(game.mode, game.scope, game.round.score);
    const summary = buildRoundSummary(game.round, catalogue, result.terminal, best);
    game.round = { ...game.round, pendingSummary: summary };
    const instanceID = game.round.instanceID;
    game.timerID = setTimeout(() => {
      if (game !== currentGame || game.round.instanceID !== instanceID) return;
      openRoundSummary(game, summary);
    }, result.terminal === "complete" ? 600 : 1000);
    return;
  }

  const instanceID = game.round.instanceID;
  game.timerID = setTimeout(() => {
    if (game !== currentGame || game.round.instanceID !== instanceID) return;
    game.round = advanceRound(game.round, catalogue);
    updateGameHUD(game);
    updateGameMap(game, false);
  }, result.correct ? 1200 : 2000);
}

function summaryCountryList(title, ids, emptyCopy, tint) {
  const list = element("ul", { className: "summary-country-list" });
  if (ids.length) {
    for (const id of ids) {
      const territory = territoryByID.get(id);
      list.append(element("li", {},
        element("span", { className: "summary-country-flag", text: territory.symbol, attrs: { "aria-hidden": "true" } }),
        element("span", { text: territory.name }),
      ));
    }
  } else {
    list.append(element("li", { className: "empty-row", text: emptyCopy }));
  }
  return element("section", { className: `summary-section tint-${tint}` },
    element("h3", { text: `${title} (${ids.length})` }),
    list,
  );
}

function trapDialogKeyboard(dialog) {
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")]
      .filter((node) => !node.disabled && !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  dialog.addEventListener("keydown", onKeyDown);
  dialog.addEventListener("cancel", (event) => event.preventDefault());
}

function openRoundSummary(game, summary) {
  if (game !== currentGame) return;
  game.round = { ...game.round, phase: "summary" };
  const complete = summary.terminal === "complete";
  const title = complete ? "Round complete" : "Out of lives";
  const status = complete ? `You cleared ${game.scope.title}` : "Review the countries you identified and missed before trying again.";
  const heading = element("h2", { id: "round-summary-title", text: title, tabIndex: -1 });
  const dialog = element("dialog", {
    className: `summary-dialog ${complete ? "is-complete" : "is-failed"}`,
    attrs: { "aria-labelledby": "round-summary-title" },
  },
  element("div", { className: "sheet-handle", attrs: { "aria-hidden": "true" } }),
  element("div", { className: "summary-status-icon" }, icon(complete ? "⚑" : "♡")),
  heading,
  element("p", { className: "summary-status", text: status }),
  complete ? element("p", { className: "summary-message", text: game.mode.completionMessage }) : null,
  element("div", { className: "summary-metrics" },
    element("div", {}, element("span", { text: "Score" }), element("strong", { text: summary.score })),
    element("div", {}, element("span", { text: summary.isNewBest ? "New best" : "Best" }), element("strong", { text: summary.best })),
  ),
  element("div", { className: "summary-results" },
    summaryCountryList("Correct", summary.correctIDs, "No correct countries yet", "green"),
    summaryCountryList("Incorrect", summary.incorrectIDs, "No missed countries", "red"),
  ),
  element("div", { className: "summary-actions" },
    element("button", { className: "primary-button", type: "button", text: "Play again", on: { click: () => playAgain(game, dialog) } }),
    element("button", { className: "secondary-button", type: "button", text: "Explore map", on: { click: () => openReviewBoard(game, dialog) } }),
    element("button", { className: "secondary-button", type: "button", text: "Main menu", on: { click: () => exitGame(game) } }),
  ));
  trapDialogKeyboard(dialog);
  game.elements.page.append(dialog);
  game.dialog = dialog;
  dialog.showModal();
  heading.focus();
  announce(title, true);
}

function playAgain(game, dialog) {
  if (game !== currentGame) return;
  clearTimeout(game.timerID);
  dialog.close();
  dialog.remove();
  game.dialog = null;
  game.round = createRound(catalogue, game.mode, game.scope, {
    bestAtRoundStart: store.best(game.mode, game.scope),
    previousMistakeNamesAtStart: store.previousMistakeNames(),
  });
  game.elements.bottom.hidden = false;
  game.elements.review.hidden = true;
  game.elements.page.classList.remove("is-reviewing");
  updateGameHUD(game, { focusIndex: 0 });
  updateGameMap(game, true);
}

function openReviewBoard(game, dialog) {
  if (game !== currentGame) return;
  dialog.close();
  dialog.remove();
  game.dialog = null;
  game.round = { ...game.round, phase: "reviewBoard" };
  game.elements.bottom.hidden = true;
  game.elements.page.classList.add("is-reviewing");
  game.elements.review.hidden = false;
  const completed = game.round.completedTerritoryIDs.map((id) => territoryByID.get(id));
  const missed = game.round.unresolvedMissIDs.map((id) => territoryByID.get(id));
  const current = territoryByID.get(targetTerritoryID(game.round));
  (game.map ?? game.getMap?.())?.showReview(completed, missed, current);
  game.elements.reviewHeading.focus();
}

function exitGame(game) {
  if (game !== currentGame) return;
  store.commitBest(game.mode, game.scope, game.round.score);
  const origin = typeof game.origin === "string" && game.origin.startsWith("/") ? game.origin : "/";
  navigate(origin, { replace: true });
}

function renderGame(route) {
  if (!route.mode || !route.scope) return renderUnavailable("That mode or practice scope is unavailable.");
  const total = eligibleTerritories(catalogue, route.mode, route.scope).length;
  if (!total) return renderUnavailable("This practice scope has no questions for that mode.");
  const mode = route.mode;
  const scope = route.scope;
  document.title = `${mode.title} — ${scope.title} — Flaguiz`;
  store.recordGameStart(mode, scope);
  const round = createRound(catalogue, mode, scope, {
    bestAtRoundStart: store.best(mode, scope),
    previousMistakeNamesAtStart: store.previousMistakeNames(),
  });
  const heading = element("h1", { className: "visually-hidden", text: `${mode.title}: ${scope.title}`, tabIndex: -1 });
  const mapSurface = element("div", { className: "map-surface game-map" });
  const modeScope = element("strong", { className: "status-mode" });
  const progress = element("span", { className: "status-progress" });
  const lives = element("span", { className: "status-lives", attrs: { role: "img" } });
  const status = element("section", { className: "game-status glass", attrs: { "aria-label": "Round status" } }, modeScope, progress, lives);
  const routeBack = element("button", {
    className: "round-icon-button back-button",
    type: "button",
    attrs: { "aria-label": "Back" },
    on: { click: goBackOrHome },
  }, icon("‹"));
  const top = element("header", { className: "game-top" }, routeBack, status);
  const choices = element("div", { className: "answer-grid" });
  const prompt = element("section", { className: "prompt-panel glass", attrs: { "aria-label": "Current question" } });
  const bottom = element("div", { className: "game-bottom" }, choices, prompt);
  const reviewHeading = element("h2", { id: "review-heading", text: "Review map", tabIndex: -1 });
  const review = element("section", { className: "review-banner glass", hidden: true },
    reviewHeading,
    element("p", { text: "Green markers are found. Red markers are still unresolved." }),
  );
  const page = element("main", { className: "game-page" },
    mapSurface,
    element("div", { className: "game-gradient game-gradient--top" }),
    element("div", { className: "game-gradient game-gradient--bottom" }),
    heading,
    top,
    review,
    bottom,
  );
  const frame = pageFrame("route-game map-route", page);
  currentGame = {
    mode,
    scope,
    origin: history.state?.origin ?? "/",
    round,
    timerID: null,
    dialog: null,
    map: null,
    elements: { page, heading, modeScope, progress, lives, prompt, choices, bottom, review, reviewHeading },
    getMap: null,
  };
  const game = currentGame;
  game.getMap = mountMap(mapSurface, { interactive: true, presentation: mode.id === "countryToFlag" ? "hybrid" : "satellite" }, (map) => {
    game.map = map;
    updateGameMap(game, true);
  });
  updateGameHUD(game);
  focusRouteHeading(frame);
}

function clearExplorerSelection(explorer, focusInput = true) {
  const hadSelection = Boolean(explorer.selected);
  explorer.query = "";
  explorer.selected = null;
  explorer.results = [];
  explorer.activeIndex = -1;
  explorer.input.value = "";
  updateExplorerUI(explorer);
  if (hadSelection) explorer.getMap()?.focusWholeEarth([0, 10], true);
  if (focusInput) explorer.input.focus();
}

function selectExplorerTerritory(explorer, territory) {
  explorer.selected = territory;
  explorer.query = territory.name;
  explorer.results = [];
  explorer.activeIndex = -1;
  explorer.input.value = territory.name;
  explorer.input.blur();
  updateExplorerUI(explorer);
  explorer.getMap()?.focusTerritory(territory, { span: 16, pitch: 55, bearing: 0, animated: true });
  requestAnimationFrame(() => explorer.factsHeading?.focus({ preventScroll: true }));
}

function updateExplorerUI(explorer) {
  explorer.results = searchTerritories(catalogue, explorer.query, explorer.selected);
  const hasResults = explorer.results.length > 0;
  explorer.input.setAttribute("aria-expanded", String(hasResults));
  explorer.input.setAttribute("aria-activedescendant", explorer.activeIndex >= 0 ? `explorer-result-${explorer.activeIndex}` : "");
  explorer.clearButton.hidden = !explorer.query && !explorer.selected;
  explorer.resultList.hidden = !hasResults;
  explorer.resultList.replaceChildren(...explorer.results.map((territory, index) => {
    const active = index === explorer.activeIndex;
    return element("li", { attrs: { role: "presentation" } },
      element("button", {
        id: `explorer-result-${index}`,
        className: `search-result ${active ? "is-active" : ""}`,
        type: "button",
        attrs: { role: "option", "aria-selected": String(active) },
        on: { click: () => selectExplorerTerritory(explorer, territory) },
      },
      element("span", { className: "search-result__flag", text: territory.symbol, attrs: { "aria-hidden": "true" } }),
      element("span", { text: territory.name }),
      ),
    );
  }));
  explorer.resultStatus.textContent = hasResults ? `${explorer.results.length} results` : "";

  explorer.status.hidden = Boolean(explorer.selected);
  if (!explorer.selected) {
    explorer.facts.classList.remove("is-visible");
    explorer.facts.hidden = true;
    return;
  }
  const territory = explorer.selected;
  const facts = (territory.flagFacts ?? []).slice(0, 2);
  const factsHeading = element("h2", { text: territory.name, tabIndex: -1 });
  explorer.factsHeading = factsHeading;
  const factContent = facts.length
    ? element("ul", { className: "facts-list" }, ...facts.map((fact) => element("li", { text: fact })))
    : element("p", { className: "empty-row", text: "No flag facts available yet." });
  explorer.facts.replaceChildren(
    element("div", { className: "facts-header" },
      element("span", { className: "facts-flag", text: territory.symbol, attrs: { "aria-hidden": "true" } }),
      element("div", {}, factsHeading, territory.continent ? element("p", { text: CONTINENT_TITLES[territory.continent] }) : null),
      element("button", {
        className: "round-icon-button facts-close",
        type: "button",
        attrs: { "aria-label": "Close flag facts" },
        on: { click: () => clearExplorerSelection(explorer, true) },
      }, icon("×")),
    ),
    factContent,
  );
  explorer.facts.hidden = false;
  requestAnimationFrame(() => explorer.facts.classList.add("is-visible"));
}

function handleExplorerKeydown(explorer, event) {
  if (event.key === "ArrowDown" && explorer.results.length) {
    event.preventDefault();
    explorer.activeIndex = (explorer.activeIndex + 1) % explorer.results.length;
    updateExplorerUI(explorer);
  } else if (event.key === "ArrowUp" && explorer.results.length) {
    event.preventDefault();
    explorer.activeIndex = explorer.activeIndex <= 0 ? explorer.results.length - 1 : explorer.activeIndex - 1;
    updateExplorerUI(explorer);
  } else if (event.key === "Enter" && explorer.results.length) {
    event.preventDefault();
    selectExplorerTerritory(explorer, explorer.results[Math.max(0, explorer.activeIndex)]);
  } else if (event.key === "Escape") {
    event.preventDefault();
    explorer.activeIndex = -1;
    explorer.resultList.hidden = true;
    explorer.input.setAttribute("aria-expanded", "false");
  }
}

function renderExplorer() {
  document.title = "Explore Flags — Flaguiz";
  const heading = element("h1", { className: "visually-hidden", text: "Explore Flags", tabIndex: -1 });
  const mapSurface = element("div", { className: "map-surface explorer-map" });
  const back = visibleBackButton("Back from Explorer");
  const input = element("input", {
    id: "country-search",
    className: "search-input",
    type: "search",
    placeholder: "Search countries",
    attrs: {
      autocomplete: "off",
      role: "combobox",
      "aria-autocomplete": "list",
      "aria-controls": "explorer-results",
      "aria-expanded": "false",
      "aria-label": "Search countries",
    },
  });
  const clearButton = element("button", {
    className: "search-clear",
    type: "button",
    hidden: true,
    attrs: { "aria-label": "Clear search" },
  }, icon("×"));
  const resultStatus = element("span", { className: "visually-hidden", attrs: { "aria-live": "polite" } });
  const resultList = element("ul", { id: "explorer-results", className: "search-results", hidden: true, attrs: { role: "listbox" } });
  const status = element("div", { className: "explorer-status" },
    element("div", {}, element("strong", { text: "Explore Flags" }), element("span", { text: `${catalogue.length} flags on the globe` })),
    element("span", { text: "Drag, pinch, and rotate" }),
  );
  const search = element("section", { className: "explorer-panel glass", attrs: { "aria-label": "Explore flags" } },
    element("div", { className: "search-row" }, icon("⌕"), input, clearButton),
    resultStatus,
    resultList,
    status,
  );
  const facts = element("aside", { className: "facts-panel glass", hidden: true, attrs: { "aria-live": "polite" } });
  const top = element("header", { className: "explorer-top" }, back, search);
  const page = element("main", { className: "explorer-page" },
    mapSurface,
    element("div", { className: "game-gradient game-gradient--top" }),
    heading,
    top,
    facts,
  );
  const frame = pageFrame("route-explorer map-route", page);
  const explorer = {
    query: "",
    selected: null,
    results: [],
    activeIndex: -1,
    input,
    clearButton,
    resultStatus,
    resultList,
    status,
    facts,
    factsHeading: null,
    getMap: null,
  };
  input.addEventListener("input", () => {
    explorer.query = input.value;
    if (explorer.selected?.name !== input.value) explorer.selected = null;
    explorer.activeIndex = -1;
    updateExplorerUI(explorer);
  });
  input.addEventListener("keydown", (event) => handleExplorerKeydown(explorer, event));
  clearButton.addEventListener("click", () => clearExplorerSelection(explorer, true));
  explorer.getMap = mountMap(mapSurface, {
    interactive: true,
    presentation: "hybrid",
    center: [0, 10],
    zoom: 0.75,
    onSelect: (territory) => selectExplorerTerritory(explorer, territory),
  }, (map) => {
    map.focusWholeEarth([0, 10]);
    map.showExplorerMarkers();
  });
  updateExplorerUI(explorer);
  focusRouteHeading(frame);
}

function metricCard(label, value, detail) {
  return element("div", { className: "metric-card" },
    element("span", { text: label }),
    element("strong", { text: value }),
    detail ? element("small", { text: detail }) : null,
  );
}

function renderStatistics() {
  document.title = "Statistics — Flaguiz";
  const data = store.snapshot();
  const totals = aggregateStatistics(catalogue, data);
  currentStatisticsSuggestions ??= createStatisticsSuggestions(catalogue, data);
  const suggestions = currentStatisticsSuggestions;
  const practice = practiceSuggestion(suggestions);
  const heading = element("h1", { text: "Statistics", tabIndex: -1 });
  const nav = element("nav", { className: "statistics-nav", attrs: { "aria-label": "Statistics" } }, visibleBackButton("Back from Statistics"), heading);
  const metrics = element("section", { className: "metric-grid", attrs: { "aria-label": "Overall progress" } },
    metricCard("Games", totals.games, "rounds started"),
    metricCard("Accuracy", totals.accuracy === null ? "--" : `${totals.accuracy}%`, "all answers"),
    metricCard("Correct", totals.correct, "guesses"),
    metricCard("Practice", practice?.scope.title ?? "Start", practice?.label ?? "regional suggestion"),
  );
  const modes = element("section", { className: "statistics-section" },
    element("h2", { text: "Game Modes" }),
    element("div", { className: "statistics-card" }, ...totals.modes.map((item) => element("div", { className: `mode-stat tint-${item.mode.tint}` },
      element("span", { className: "mode-stat__icon" }, icon(item.mode.icon)),
      element("div", {}, element("strong", { text: item.mode.title }), element("span", { text: `${item.games} games` })),
      element("div", { className: "mode-stat__metrics" },
        element("span", { text: item.accuracy === null ? "--" : `${item.accuracy}%` }),
        element("small", { text: `Best ${item.best}` }),
      ),
    ))),
  );
  const practiceNext = element("section", { className: "statistics-section" },
    element("h2", { text: "Practice Next" }),
    element("div", { className: "statistics-card" }, ...suggestions.map((suggestion) => {
      const path = `/play/${suggestion.mode.slug}/${suggestion.scope.id}/`;
      const total = eligibleTerritories(catalogue, suggestion.mode, suggestion.scope).length;
      const best = Number(data.scores[configurationKey(suggestion.mode, suggestion.scope)] ?? 0);
      return gameLink(path, `practice-row tint-${suggestion.mode.tint}`,
        element("span", { className: "practice-row__icon" }, icon("◎")),
        element("span", { className: "practice-row__body" },
          element("span", { className: "eyebrow", text: suggestion.label }),
          element("strong", { text: suggestion.scope.title }),
          element("span", { text: `${suggestion.mode.shortTitle} · ${best}/${total} best` }),
        ),
        icon("›", "disclosure"),
      );
    })),
  );
  const confusions = [...data.mistakeDetails].sort((left, right) => right.count - left.count).slice(0, 8);
  const confusionContent = confusions.length
    ? element("div", { className: "statistics-card" }, ...confusions.map((mistake) => {
      const correct = territoryByName.get(mistake.correctTerritoryName);
      const incorrect = territoryByName.get(mistake.incorrectTerritoryName);
      return element("div", { className: "confusion-row" },
        element("span", { className: "confusion-flags", attrs: { "aria-hidden": "true" } }, correct?.symbol ?? "", incorrect?.symbol ?? ""),
        element("span", { className: "confusion-copy" },
          element("strong", { text: mistake.correctTerritoryName }),
          element("span", { text: `Chosen as ${mistake.incorrectTerritoryName}` }),
        ),
        element("strong", { className: "confusion-count", text: mistake.count }),
      );
    }))
    : element("div", { className: "statistics-card empty-state" },
      icon("↗"),
      element("strong", { text: "No mistakes recorded yet" }),
      element("span", { text: "Mistakes will appear here after a few rounds." }),
    );
  const topConfusions = element("section", { className: "statistics-section" }, element("h2", { text: "Top Confusions" }), confusionContent);
  const main = element("main", { className: "statistics-page" },
    nav,
    metrics,
    modes,
    practiceNext,
    topConfusions,
    element("footer", { className: "statistics-footer" },
      element("span", { text: "Progress stays in this browser." }),
      appLink("/acknowledgements/", "", "Map & accessibility notes"),
    ),
  );
  const frame = pageFrame("route-statistics", main);
  focusRouteHeading(frame);
}

function renderAcknowledgements() {
  document.title = "Map & Accessibility Notes — Flaguiz";
  const heading = element("h1", { text: "Map & accessibility notes", tabIndex: -1 });
  const main = element("main", { className: "simple-page acknowledgements-page" },
    appLink("/", "text-back-link", "‹ Flaguiz"),
    element("article", { className: "simple-card prose-card" },
      heading,
      element("p", { text: "Flaguiz is a visual flag-learning game. Flag-identification questions necessarily rely on seeing the flag; navigation, progress, country names, capital questions, and the rest of the interface are designed for keyboard and screen-reader operation." }),
      element("h2", { text: "iOS game" }),
      element("p", {}, "Prefer the native version? ",
        element("a", { href: IOS_APP_URL, text: "Get Flagiuz – Flags & Capitals on the App Store" }),
        ".",
      ),
      element("h2", { text: "Map data" }),
      element("p", {}, "Country boundaries come from Natural Earth 50m Admin 0 map units. Natural Earth data is public domain. ",
        element("a", { href: "https://www.naturalearthdata.com/", text: "Natural Earth" }),
      ),
      element("h2", { text: "Map renderer" }),
      element("p", {}, "Interactive maps are rendered locally with MapLibre GL JS under the BSD 3-Clause licence. No commercial tile token or private map credential is included."),
      element("h2", { text: "Privacy" }),
      element("p", { text: "The game has no account and sends no game statistics to a server. Best scores, play counts, accuracy, and mistake history are stored only in this browser." }),
      element("h2", { text: "Keyboard" }),
      element("p", { text: "Use Tab and Shift+Tab to move through actions, Enter or Space to choose an answer, and Arrow keys plus Enter in country search. Summary dialogs remain open until Play again, Explore map, or Main menu is chosen." }),
    ),
  );
  const frame = pageFrame("route-simple", main);
  focusRouteHeading(frame);
}

function renderRoute() {
  cleanupRoute();
  const route = parseRoute();
  currentRoute = route;
  if (route.name === "home") renderHome();
  else if (route.name === "setup") renderSetup(route);
  else if (route.name === "game") renderGame(route);
  else if (route.name === "explore") renderExplorer();
  else if (route.name === "statistics") renderStatistics();
  else if (route.name === "acknowledgements") renderAcknowledgements();
  else renderUnavailable();
}

async function initialise() {
  try {
    const response = await fetch(new URL("data/territories.json", document.baseURI), { cache: "force-cache" });
    if (!response.ok) throw new Error(`Territory catalogue returned ${response.status}.`);
    catalogue = validateCatalogue(await response.json());
    territoryByID = new Map(catalogue.map((territory) => [territory.id, territory]));
    territoryByName = new Map(catalogue.map((territory) => [territory.name, territory]));
    store = createUserDataStore();
    store.subscribe((_data, reason) => {
      if (reason !== "external") return;
      if (currentRoute?.name === "statistics" || currentRoute?.name === "setup") renderRoute();
    });
    if (!history.state?.flaguiz) {
      history.replaceState({ flaguiz: true, flaguizDepth: 0, origin: null }, "", globalThis.location.href);
    }
    bootStatus?.remove();
    renderRoute();
  } catch (error) {
    console.error("Flaguiz catalogue failed to load", error);
    bootStatus?.remove();
    store = createUserDataStore(null);
    document.title = "Data unavailable — Flaguiz";
    const heading = element("h1", { text: "Flag data unavailable", tabIndex: -1 });
    const main = element("main", { className: "simple-page" },
      element("section", { className: "simple-card" }, icon("!"), heading, element("p", { text: "The verified territory catalogue could not be loaded, so the game has stopped rather than using a partial list." }), element("button", { className: "primary-button", type: "button", text: "Reload", on: { click: () => globalThis.location.reload() } })),
    );
    const frame = pageFrame("route-simple", main);
    focusRouteHeading(frame);
  }
}

globalThis.addEventListener("popstate", renderRoute);
globalThis.addEventListener("resize", () => activeMap?.resize(), { passive: true });
globalThis.addEventListener("pagehide", () => {
  if (currentGame) store?.commitBest(currentGame.mode, currentGame.scope, currentGame.round.score);
  globalThis.speechSynthesis?.cancel?.();
});

initialise();
