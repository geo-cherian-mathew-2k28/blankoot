// Centralized Super Admin & Dynamic Smartboard Host Authentication
// Super Admin: geocherianmathew@gmail.com (Full Control over Questions, Passkeys, and Rooms via /admin)
// Smartboards (/host): Unlocked with the dynamic Host Passkey set by the Super Admin

export const SUPER_ADMIN_EMAILS = [
  "geocherianmathew@gmail.com",
  "blankspacecommunity@gmail.com",
];

export const DEFAULT_PRESENTER_PASSCODES = [
  "BLANK2026",
  "BLANKSPACE",
  "HOST2026",
];

const PASSKEY_STORAGE_KEY = 'blankspace_dynamic_host_passkey';

export function getStoredHostPasskey(): string {
  try {
    return localStorage.getItem(PASSKEY_STORAGE_KEY) || 'BLANK2026';
  } catch {
    return 'BLANK2026';
  }
}

export function setStoredHostPasskey(newPasskey: string): void {
  try {
    localStorage.setItem(PASSKEY_STORAGE_KEY, newPasskey.trim().toUpperCase());
  } catch {}
}

export function validatePresenterPasscode(
  enteredCode: string | null | undefined,
  dynamicPasskey?: string | null
): boolean {
  if (!enteredCode) return false;
  const clean = enteredCode.trim().toUpperCase();

  // 1. Check dynamic passkey passed or stored
  const activePasskey = (dynamicPasskey || getStoredHostPasskey()).trim().toUpperCase();
  if (clean === activePasskey) return true;

  // 2. Check environment variable override
  const envPass = import.meta.env.VITE_PRESENTER_PASSCODE;
  if (envPass && envPass.trim().toUpperCase() === clean) return true;

  // 3. Check fallback defaults
  return DEFAULT_PRESENTER_PASSCODES.includes(clean);
}

export const SUPER_ADMIN_SECRET_KEYS = [
  "GEO2026",
  "ADMIN2026",
  "SUPERADMIN2026",
  "BLANKSPACE2026"
];

export function validateSuperAdminKey(key: string | null | undefined): boolean {
  if (!key) return false;
  const clean = key.trim().toUpperCase();
  const envKey = import.meta.env.VITE_SUPER_ADMIN_KEY;
  if (envKey && envKey.trim().toUpperCase() === clean) return true;
  return SUPER_ADMIN_SECRET_KEYS.includes(clean);
}

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  const envAdmins = import.meta.env.VITE_SUPER_ADMIN_EMAILS || import.meta.env.VITE_HOST_EMAILS;
  if (envAdmins) {
    const list = envAdmins.split(',').map((e: string) => e.trim().toLowerCase());
    if (list.includes(normalized)) return true;
  }

  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}

export function isAuthorizedHost(email: string | null | undefined): boolean {
  return isSuperAdmin(email);
}



