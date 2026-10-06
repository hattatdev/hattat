/** Actionable runtime error. @example throw failure(2, "Invalid intensity", "Use 0–1."); */
export function failure(code: number, what: string, fix: string): Error {
  return new Error(`HATTAT_E${String(code).padStart(3, "0")}: ${what}. ${fix}`);
}
