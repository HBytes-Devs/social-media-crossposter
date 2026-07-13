const REMEMBER_LOGIN_KEY = "smc_remember_login";

type RememberedLogin = {
  email: string;
  password: string;
};

function encode(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch {
    return value;
  }
}

function decode(value: string): string {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return "";
  }
}

export function loadRememberedLogin(): RememberedLogin | null {
  const raw = localStorage.getItem(REMEMBER_LOGIN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { email?: string; password?: string };
    if (!parsed.email || !parsed.password) return null;

    return {
      email: decode(parsed.email),
      password: decode(parsed.password),
    };
  } catch {
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
    return null;
  }
}

export function saveRememberedLogin(email: string, password: string): void {
  localStorage.setItem(
    REMEMBER_LOGIN_KEY,
    JSON.stringify({
      email: encode(email.trim()),
      password: encode(password),
    }),
  );
}

export function clearRememberedLogin(): void {
  localStorage.removeItem(REMEMBER_LOGIN_KEY);
}

export function hasRememberedLogin(): boolean {
  return loadRememberedLogin() !== null;
}
