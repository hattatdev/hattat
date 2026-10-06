import { mount } from "hattat";
import { gearTrain } from "hattat/figures/gear-train";

const hero = document.querySelector("#hero");
if (hero instanceof HTMLElement) {
  mount(hero, gearTrain, { intensity: 0.6 });
}
