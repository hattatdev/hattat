import { Scene } from "../packages/core/dist/index.js";
import type { FigureDefinition, FigureHandle } from "../packages/core/src/types.js";
import { barCity } from "../packages/hattat/dist/figures/bar-city.js";
import { bridge } from "../packages/hattat/dist/figures/bridge.js";
import { dbStack } from "../packages/hattat/dist/figures/db-stack.js";
import { deskLamp } from "../packages/hattat/dist/figures/desk-lamp.js";
import { drawerStack } from "../packages/hattat/dist/figures/drawer-stack.js";
import { emptyBox } from "../packages/hattat/dist/figures/empty-box.js";
import { envelope } from "../packages/hattat/dist/figures/envelope.js";
import { gearTrain } from "../packages/hattat/dist/figures/gear-train.js";
import { padlock } from "../packages/hattat/dist/figures/padlock.js";
import { pendulum } from "../packages/hattat/dist/figures/pendulum.js";
import { serverRack } from "../packages/hattat/dist/figures/server-rack.js";
import { shieldLayers } from "../packages/hattat/dist/figures/shield-layers.js";
import { waveField } from "../packages/hattat/dist/figures/wave-field.js";
import { windTurbine } from "../packages/hattat/dist/figures/wind-turbine.js";
import { mount } from "../packages/hattat/dist/index.js";

declare global {
  interface Window {
    fixture: {
      mount: typeof mount;
      figures: readonly FigureDefinition[];
      handles: FigureHandle[];
      Scene: typeof Scene;
    };
  }
}
window.fixture = {
  mount,
  figures: [
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
  ],
  handles: [],
  Scene,
};
