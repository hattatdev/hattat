import { mount } from "hattat";
import type { FigureDefinition, FigureHandle, Theme } from "hattat/core";
import { barCity } from "hattat/figures/bar-city";
import { bridge } from "hattat/figures/bridge";
import { dbStack } from "hattat/figures/db-stack";
import { deskLamp } from "hattat/figures/desk-lamp";
import { drawerStack } from "hattat/figures/drawer-stack";
import { emptyBox } from "hattat/figures/empty-box";
import { envelope } from "hattat/figures/envelope";
import { gearTrain } from "hattat/figures/gear-train";
import { padlock } from "hattat/figures/padlock";
import { pendulum } from "hattat/figures/pendulum";
import { serverRack } from "hattat/figures/server-rack";
import { shieldLayers } from "hattat/figures/shield-layers";
import { waveField } from "hattat/figures/wave-field";
import { windTurbine } from "hattat/figures/wind-turbine";

const FIGURES = [
  serverRack,
  padlock,
  drawerStack,
  gearTrain,
  waveField,
  barCity,
  bridge,
  deskLamp,
  windTurbine,
  pendulum,
  envelope,
  emptyBox,
  dbStack,
  shieldLayers,
];
const TITLES = FIGURES.map((figure) =>
  figure.name.replace(
    /(^|-)([a-z])/g,
    (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`,
  ),
);
const TOTAL = String(FIGURES.length).padStart(2, "0");
const CATEGORY_TITLES: Record<string, string> = {
  "nature-abstract": "nature",
  "ui-concepts": "interface",
};
const THEMES: Record<string, Theme> = {
  paper: {
    plate: "#f5f3ec",
    hi: "#242820",
    edge: "#343b30",
    mid: "#72786b",
    lo: "#a1a597",
    accent: "#a13f24",
  },
  ink: {
    plate: "#20251f",
    hi: "#f5f3ec",
    edge: "#dedfd2",
    mid: "#a0a995",
    lo: "#69765e",
    accent: "#eba383",
  },
  blue: {
    plate: "#eaf0f4",
    hi: "#183e61",
    edge: "#274d70",
    mid: "#607f99",
    lo: "#91a7b8",
    accent: "#9c482c",
  },
};

function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node)
    throw Error(
      `HATTAT_E904: Gallery element ${selector} is missing. Rebuild the matching HTML and script with pnpm build.`,
    );
  return node;
}

const grid = element("#figure-grid");
const search = element<HTMLInputElement>("#search");
const select = element<HTMLSelectElement>("#figure-select");
const intensity = element<HTMLInputElement>("#intensity");
const animate = element<HTMLButtonElement>("#animate");
const copy = element<HTMLButtonElement>("#copy-code");
const code = element("#code");
const host = element("#playground-figure");
const count = element("#result-count");
const cards: HTMLElement[] = [];
const handles: FigureHandle[] = [];
let current: FigureDefinition = gearTrain;
let theme = THEMES.paper as Theme;
let category = "all";
let autoplay = false;
let playground: FigureHandle;
let copyReset: ReturnType<typeof setTimeout> | undefined;

function addText(parent: HTMLElement, tag: string, text: string, className = ""): HTMLElement {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  parent.append(node);
  return node;
}

function updateCode(): void {
  const symbol = current.name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  const extra = autoplay ? ", autoplay: true" : "";
  const themeCode = JSON.stringify(theme);
  code.textContent = `import { mount } from "hattat";\nimport { ${symbol} } from "hattat/figures/${current.name}";\n\nconst host = document.querySelector("#figure");\nif (host instanceof HTMLElement) {\n  mount(host, ${symbol}, {\n    intensity: ${Number(intensity.value) / 100}${extra},\n    theme: ${themeCode}\n  });\n}`;
  copy.textContent = "Copy code";
  if (copyReset) clearTimeout(copyReset);
}

function showFigure(figure: FigureDefinition): void {
  playground?.destroy();
  current = figure;
  select.value = figure.name;
  element("#playground-title").textContent =
    TITLES[FIGURES.findIndex((item) => item.name === figure.name)] ?? figure.name;
  element("#interaction").textContent = figure.interaction;
  element("#playground-category").textContent = CATEGORY_TITLES[figure.category] ?? figure.category;
  playground = mount(host, figure, { intensity: Number(intensity.value) / 100, autoplay, theme });
  updateCode();
}

FIGURES.forEach((figure, index) => {
  const option = document.createElement("option");
  option.value = figure.name;
  option.textContent = TITLES[index] ?? figure.name;
  select.append(option);
  const card = document.createElement("article");
  card.className = "figure-card";
  card.dataset.name = figure.name;
  const header = addText(card, "div", "", "card-meta");
  addText(header, "span", String(index + 1).padStart(2, "0"));
  addText(header, "span", CATEGORY_TITLES[figure.category] ?? figure.category);
  const preview = addText(card, "div", "", "card-figure");
  handles.push(mount(preview, figure, { theme }));
  const details = addText(card, "div", "", "card-details");
  addText(details, "h3", TITLES[index] ?? figure.name);
  addText(details, "p", figure.interaction);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "try-button";
  button.textContent = "Try in playground ↗";
  button.setAttribute("aria-label", `Try ${TITLES[index]} in playground`);
  button.addEventListener("click", () => {
    showFigure(figure);
    element("#playground").scrollIntoView({ behavior: "smooth", block: "start" });
    select.focus({ preventScroll: true });
  });
  details.append(button);
  grid.append(card);
  cards.push(card);
});
handles.push(mount(element("#hero-figure"), gearTrain, { theme, intensity: 0.8 }));
showFigure(gearTrain);

function filter(): void {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  FIGURES.forEach((figure, index) => {
    const match =
      (category === "all" || figure.category === category) &&
      `${TITLES[index]} ${figure.name} ${figure.category} ${figure.intents.join(" ")}`
        .toLowerCase()
        .includes(query);
    const card = cards[index];
    if (card) card.hidden = !match;
    if (match) visible++;
  });
  count.textContent = `${String(visible).padStart(2, "0")} / ${TOTAL} figures`;
  element("#empty-state").hidden = visible !== 0;
}
search.addEventListener("input", filter);
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-category]")) {
  button.addEventListener("click", () => {
    category = button.dataset.category ?? "all";
    for (const other of document.querySelectorAll("[data-category]")) {
      other.setAttribute("aria-pressed", String(other === button));
    }
    filter();
  });
}
element("#reset-search").addEventListener("click", () => {
  search.value = "";
  document.querySelector<HTMLButtonElement>('[data-category="all"]')?.click();
  search.focus();
});
select.addEventListener("change", () => {
  const figure = FIGURES.find((item) => item.name === select.value);
  if (figure) showFigure(figure);
});
intensity.addEventListener("input", () => {
  element("#intensity-value").textContent = `${intensity.value}%`;
  playground.update({ intensity: Number(intensity.value) / 100 });
  updateCode();
});
animate.addEventListener("click", () => {
  autoplay = !autoplay;
  animate.setAttribute("aria-pressed", String(autoplay));
  animate.textContent = autoplay ? "Pause demo" : "Play demo";
  playground.update({ autoplay });
  updateCode();
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]")) {
  button.addEventListener("click", () => {
    const name = button.dataset.themeChoice ?? "paper";
    theme = THEMES[name] ?? (THEMES.paper as Theme);
    document.documentElement.dataset.theme = name;
    for (const other of document.querySelectorAll("[data-theme-choice]")) {
      other.setAttribute("aria-pressed", String(other === button));
    }
    for (const handle of handles) handle.update({ theme });
    playground.update({ theme });
    updateCode();
  });
}
copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(code.textContent ?? "");
    copy.textContent = "Copied!";
    element("#copy-status").textContent = "Example copied to clipboard.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    copy.textContent = "Code selected";
    element("#copy-status").textContent =
      "Copy unavailable. Code selected; press Ctrl+C or Command+C.";
  }
  copyReset = setTimeout(() => {
    copy.textContent = "Copy code";
  }, 2500);
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function showMotionPreference(): void {
  element("#motion-note").textContent = reduced.matches
    ? "Reduced motion is on. Figures stay in their resting pose."
    : "Move your pointer over the figure, or focus it and use the arrow keys.";
}
showMotionPreference();
reduced.addEventListener("change", showMotionPreference);
window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  for (const handle of handles) handle.destroy();
  playground.destroy();
  reduced.removeEventListener("change", showMotionPreference);
  if (copyReset) clearTimeout(copyReset);
});
