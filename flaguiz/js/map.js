import {
  boundaryForTerritory,
  boundsForFeatureCollection,
  buildBoundaryIndex,
} from "./domain.js";

let boundaryPromise = null;

export function loadBoundaryData() {
  if (!boundaryPromise) {
    const url = new URL("data/country-boundaries.geojson", document.baseURI);
    boundaryPromise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary data returned ${response.status}.`);
        return response.json();
      })
      .then((collection) => ({ collection, index: buildBoundaryIndex(collection) }));
  }
  return boundaryPromise;
}

function builtInStyle(presentation) {
  const hybrid = presentation === "hybrid";
  return {
    version: 8,
    name: "Flaguiz local Natural Earth",
    sources: {
      world: {
        type: "geojson",
        data: new URL("data/country-boundaries.geojson", document.baseURI).href,
        attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>',
      },
    },
    layers: [
      {
        id: "ocean",
        type: "background",
        paint: {
          "background-color": hybrid ? "#061b2d" : "#02070d",
        },
      },
      {
        id: "land",
        type: "fill",
        source: "world",
        paint: {
          "fill-color": hybrid ? "#204f50" : "#172c28",
          "fill-opacity": hybrid ? 0.9 : 0.96,
        },
      },
      {
        id: "coastlines",
        type: "line",
        source: "world",
        paint: {
          "line-color": hybrid ? "#72a79f" : "#345246",
          "line-opacity": hybrid ? 0.64 : 0.52,
          "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.45, 5, 1.2],
        },
      },
    ],
  };
}

function expandedBounds(bounds) {
  if (!bounds) return null;
  const [west, south, east, north] = bounds;
  const width = Math.max(0.6, Math.abs(east - west));
  const height = Math.max(0.6, Math.abs(north - south));
  return [
    [west - width * 0.18, Math.max(-85, south - height * 0.18)],
    [east + width * 0.18, Math.min(85, north + height * 0.18)],
  ];
}

function markerElement(territory, kind, showsTitle, onSelect) {
  const selectable = kind === "exploration";
  const element = document.createElement(selectable ? "button" : "div");
  element.className = `map-marker map-marker--${kind}`;
  if (selectable) {
    element.type = "button";
    element.setAttribute("aria-label", `Explore ${territory.name}`);
    element.addEventListener("click", () => onSelect?.(territory));
  } else {
    element.setAttribute("aria-hidden", "true");
  }
  const pin = document.createElement("span");
  pin.className = "map-marker__pin";
  const glyph = document.createElement("span");
  glyph.className = "map-marker__glyph";
  glyph.textContent = kind === "current" ? "⌖" : territory.symbol;
  pin.append(glyph);
  element.append(pin);
  if (showsTitle) {
    const label = document.createElement("span");
    label.className = "map-marker__label";
    label.textContent = territory.name;
    element.append(label);
  }
  return element;
}

export class FlaguizMap {
  constructor(options) {
    this.container = options.container;
    this.catalogue = options.catalogue;
    this.presentation = options.presentation ?? "hybrid";
    this.interactive = options.interactive ?? true;
    this.onFailure = options.onFailure;
    this.onSelect = options.onSelect;
    this.markers = [];
    this.cameraKey = null;
    this.destroyed = false;
    this.readyCallbacks = [];
    this.ready = false;
    this.reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const maplibregl = globalThis.maplibregl;
    if (!maplibregl?.Map) {
      this.fail(new Error("MapLibre is unavailable."));
      return;
    }
    try {
      this.map = new maplibregl.Map({
        container: this.container,
        style: builtInStyle(this.presentation),
        center: options.center ?? [0, 10],
        zoom: options.zoom ?? 0.75,
        bearing: 0,
        pitch: 0,
        interactive: this.interactive,
        attributionControl: true,
        renderWorldCopies: true,
        cooperativeGestures: false,
      });
      this.map.getCanvas().setAttribute(
        "aria-label",
        this.interactive
          ? "Interactive world map. Drag to pan, pinch or scroll to zoom, and drag with two fingers or the right mouse button to rotate."
          : "Decorative world map.",
      );
      this.map.getCanvas().setAttribute("role", "img");
      if (this.interactive) {
        this.map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "bottom-right");
        this.map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-left");
      }
      this.map.once("load", () => {
        if (this.destroyed) return;
        try {
          this.map.setProjection({ type: "globe" });
        } catch {
          // Mercator remains a supported fallback.
        }
        this.ensureTargetLayers();
        this.ready = true;
        for (const callback of this.readyCallbacks.splice(0)) callback();
      });
      this.map.on("error", (event) => {
        if (!this.ready && event?.error) this.fail(event.error);
      });
    } catch (error) {
      this.fail(error);
    }
  }

  fail(error) {
    if (this.destroyed) return;
    this.onFailure?.(error instanceof Error ? error : new Error(String(error)));
  }

  afterReady(callback) {
    if (this.destroyed || !this.map) return;
    if (this.ready) callback();
    else this.readyCallbacks.push(callback);
  }

  ensureTargetLayers() {
    if (!this.map.getSource("flaguiz-target")) {
      this.map.addSource("flaguiz-target", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      this.map.addLayer({
        id: "flaguiz-target-fill",
        type: "fill",
        source: "flaguiz-target",
        paint: { "fill-color": "#007aff", "fill-opacity": 0.22 },
      });
      this.map.addLayer({
        id: "flaguiz-target-outline",
        type: "line",
        source: "flaguiz-target",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#34c759", "line-opacity": 0.95, "line-width": 3 },
      });
    }
  }

  setInteractive(interactive) {
    this.interactive = interactive;
    this.afterReady(() => {
      const handlers = ["boxZoom", "scrollZoom", "dragPan", "dragRotate", "keyboard", "doubleClickZoom", "touchZoomRotate"];
      for (const key of handlers) this.map[key]?.[interactive ? "enable" : "disable"]?.();
    });
  }

  setPresentation(presentation) {
    this.presentation = presentation;
    this.afterReady(() => {
      const hybrid = presentation === "hybrid";
      this.map.setPaintProperty("ocean", "background-color", hybrid ? "#061b2d" : "#02070d");
      this.map.setPaintProperty("land", "fill-color", hybrid ? "#204f50" : "#172c28");
      this.map.setPaintProperty("coastlines", "line-color", hybrid ? "#72a79f" : "#345246");
      this.container.dataset.presentation = presentation;
    });
  }

  setTargetBoundary(featureCollection) {
    this.afterReady(() => {
      this.ensureTargetLayers();
      this.map.getSource("flaguiz-target")?.setData(featureCollection ?? { type: "FeatureCollection", features: [] });
    });
  }

  clearMarkers() {
    for (const marker of this.markers) marker.remove();
    this.markers = [];
  }

  setMarkers(markerModels) {
    this.afterReady(() => {
      this.clearMarkers();
      const maplibregl = globalThis.maplibregl;
      for (const model of markerModels) {
        const element = markerElement(model.territory, model.kind, Boolean(model.showsTitle), this.onSelect);
        const marker = new maplibregl.Marker({ element, anchor: "bottom" })
          .setLngLat([model.territory.centerLongitude, model.territory.centerLatitude])
          .addTo(this.map);
        if (model.kind === "exploration") {
          element.setAttribute("aria-label", `Explore ${model.territory.name}`);
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", "true");
          element.removeAttribute("aria-label");
          element.removeAttribute("role");
          element.removeAttribute("tabindex");
        }
        this.markers.push(marker);
      }
    });
  }

  focusWholeEarth(center = [0, 10], animated = false) {
    this.cameraKey = "whole-earth";
    this.afterReady(() => {
      const camera = { center, zoom: 0.75, pitch: 0, bearing: 0, duration: this.reducedMotion ? 0 : 550 };
      if (animated && !this.reducedMotion) this.map.easeTo(camera);
      else this.map.jumpTo(camera);
    });
  }

  focusTerritory(territory, options = {}) {
    const key = `${territory.id}:${options.boundary ? "boundary" : "pin"}`;
    if (this.cameraKey === key) return;
    this.cameraKey = key;
    this.afterReady(() => {
      const animate = options.animated !== false && !this.reducedMotion;
      const bounds = options.boundary ? expandedBounds(boundsForFeatureCollection(options.boundary)) : null;
      if (bounds && Math.abs(bounds[1][0] - bounds[0][0]) < 300) {
        this.map.fitBounds(bounds, {
          padding: options.padding ?? { top: 112, right: 52, bottom: 250, left: 52 },
          bearing: 0,
          maxZoom: 7.5,
          duration: animate ? 700 : 0,
        });
        return;
      }
      const span = options.span ?? 40;
      const zoom = Math.max(1.8, Math.min(6.2, 5.6 - Math.log2(span / 10)));
      const camera = {
        center: [territory.centerLongitude, territory.centerLatitude],
        zoom,
        pitch: options.pitch ?? 35,
        bearing: options.bearing ?? 12,
        duration: animate ? 650 : 0,
      };
      if (animate) this.map.easeTo(camera);
      else this.map.jumpTo(camera);
    });
  }

  async showGameTarget(territory, mode, scope, resultMarkers = [], first = false) {
    this.setPresentation(mode.id === "countryToFlag" ? "hybrid" : "satellite");
    let boundary = null;
    if (mode.id !== "countryToFlag") {
      try {
        const { index } = await loadBoundaryData();
        const candidate = boundaryForTerritory(territory, index);
        if (candidate.features.length) boundary = candidate;
      } catch {
        boundary = null;
      }
    }
    this.setTargetBoundary(boundary);
    const current = boundary ? [] : [{ territory, kind: "current", showsTitle: mode.id === "countryToFlag" }];
    this.setMarkers([...resultMarkers, ...current]);
    this.focusTerritory(territory, {
      boundary,
      span: scope.span,
      animated: !first,
    });
    return boundary;
  }

  showReview(completed, missed, current) {
    this.setPresentation("hybrid");
    this.setTargetBoundary(null);
    const markers = [
      ...completed.map((territory) => ({ territory, kind: "completed", showsTitle: true })),
      ...missed.map((territory) => ({ territory, kind: "missed", showsTitle: true })),
    ];
    if (current) markers.push({ territory: current, kind: "current", showsTitle: true });
    this.setMarkers(markers);
  }

  showExplorerMarkers() {
    this.setPresentation("hybrid");
    this.setTargetBoundary(null);
    this.setMarkers(this.catalogue.map((territory) => ({ territory, kind: "exploration", showsTitle: false })));
  }

  resize() {
    this.map?.resize();
  }

  destroy() {
    this.destroyed = true;
    this.readyCallbacks = [];
    this.clearMarkers();
    this.map?.remove();
    this.map = null;
  }
}
