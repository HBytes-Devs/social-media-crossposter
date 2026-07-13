export const COMPOSE_AUTO_CORRECT_KEY = "smc_compose_auto_correct";
export const COMPOSE_SMART_SUGGEST_KEY = "smc_compose_smart_suggest";
export const COMPOSE_AUTO_IMAGE_KEY = "smc_compose_auto_image";

export function readComposePref(key: string, defaultValue: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // ignore
  }
  return defaultValue;
}

export function writeComposePref(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "true" : "false");
  } catch {
    // ignore
  }
}
