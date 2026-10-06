export interface ActiveFigure {
  internalActive: boolean;
  internalDestroyed: boolean;
  internalStep(dt: number, time: number): boolean;
}
const FIGURES: ActiveFigure[] = [];
let token = 0,
  last = 0;
function frame(time: number): void {
  token = 0;
  const dt = last ? Math.max(0, (time - last) / 1000) : 1 / 60;
  last = time;
  let running = false;
  for (let i = 0; i < FIGURES.length; i++) {
    const figure = FIGURES[i] as ActiveFigure;
    if (figure.internalActive && !figure.internalDestroyed) {
      figure.internalActive = figure.internalStep(dt, time);
      if (figure.internalActive) running = true;
    }
  }
  if (running) token = requestAnimationFrame(frame);
  else last = 0;
}
export function register(figure: ActiveFigure): void {
  FIGURES.push(figure);
}
export function wake(figure: ActiveFigure): void {
  figure.internalActive = true;
  if (!token && typeof requestAnimationFrame === "function") token = requestAnimationFrame(frame);
}
export function unregister(figure: ActiveFigure): void {
  const i = FIGURES.indexOf(figure);
  if (i >= 0) FIGURES.splice(i, 1);
  if (!FIGURES.some((f) => f.internalActive) && token) {
    cancelAnimationFrame(token);
    token = 0;
    last = 0;
  }
}
