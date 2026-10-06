export { barCity } from "./bar-city.js";
export { bridge } from "./bridge.js";
export { dbStack } from "./db-stack.js";
export { deskLamp } from "./desk-lamp.js";
export { drawerStack } from "./drawer-stack.js";
export { emptyBox } from "./empty-box.js";
export { envelope } from "./envelope.js";
export { gearTrain } from "./gear-train.js";
export { padlock } from "./padlock.js";
export { pendulum } from "./pendulum.js";
export { serverRack } from "./server-rack.js";
export { shieldLayers } from "./shield-layers.js";
export { waveField } from "./wave-field.js";
export { windTurbine } from "./wind-turbine.js";

import { barCity } from "./bar-city.js";
import { bridge } from "./bridge.js";
import { dbStack } from "./db-stack.js";
import { deskLamp } from "./desk-lamp.js";
import { drawerStack } from "./drawer-stack.js";
import { emptyBox } from "./empty-box.js";
import { envelope } from "./envelope.js";
import { gearTrain } from "./gear-train.js";
import { padlock } from "./padlock.js";
import { pendulum } from "./pendulum.js";
import { serverRack } from "./server-rack.js";
import { shieldLayers } from "./shield-layers.js";
import { waveField } from "./wave-field.js";
import { windTurbine } from "./wind-turbine.js";
export const FIGURES = {
  "drawer-stack": drawerStack,
  "server-rack": serverRack,
  padlock,
  "gear-train": gearTrain,
  "wave-field": waveField,
  "bar-city": barCity,
  bridge,
  "desk-lamp": deskLamp,
  "wind-turbine": windTurbine,
  pendulum,
  envelope,
  "empty-box": emptyBox,
  "db-stack": dbStack,
  "shield-layers": shieldLayers,
} as const;
/** Known figure names, derived from the concrete registry. */
export type FigureName = keyof typeof FIGURES;
