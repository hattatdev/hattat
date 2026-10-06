export { drawerStack } from "./drawer-stack.js";
export { gearTrain } from "./gear-train.js";
export { padlock } from "./padlock.js";
export { serverRack } from "./server-rack.js";
export { waveField } from "./wave-field.js";

import { drawerStack } from "./drawer-stack.js";
import { gearTrain } from "./gear-train.js";
import { padlock } from "./padlock.js";
import { serverRack } from "./server-rack.js";
import { waveField } from "./wave-field.js";
export const FIGURES = {
  "drawer-stack": drawerStack,
  "server-rack": serverRack,
  padlock,
  "gear-train": gearTrain,
  "wave-field": waveField,
} as const;
/** Known figure names, derived from the concrete registry. */
export type FigureName = keyof typeof FIGURES;
