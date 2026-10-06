import { Scene } from "../packages/core/dist/index.js";
import type { FigureDefinition, FigureHandle } from "../packages/core/src/types.js";
import { drawerStack } from "../packages/hattat/dist/figures/drawer-stack.js";
import { gearTrain } from "../packages/hattat/dist/figures/gear-train.js";
import { padlock } from "../packages/hattat/dist/figures/padlock.js";
import { serverRack } from "../packages/hattat/dist/figures/server-rack.js";
import { waveField } from "../packages/hattat/dist/figures/wave-field.js";
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
  figures: [serverRack, padlock, drawerStack, gearTrain, waveField],
  handles: [],
  Scene,
};
