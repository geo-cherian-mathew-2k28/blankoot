// Centralized Super Admin & Dynamic Smartboard Host Authentication
// Super Admin: geocherianmathew@gmail.com (Full Control over Questions, Passkeys, and Rooms via /admin)
// Smartboards (/host): Unlocked with the dynamic Host Passkey set by the Super Admin

import { getLocalPasskey } from './quizConfigSync';

export const SUPER_ADMIN_EMAILS = [
  "geocherianmathew@gmail.com",
  "blankspacecommunity@gmail.com",
];

export function getStoredHostPasskey(): string {
  return getLocalPasskey();
}

export function setStoredHostPasskey(newPasskey: string): void {
  try {
    localStorage.setItem('blankspace_dynamic_host_passkey', newPasskey.trim().toUpperCase());
  } catch {}
}

export function validatePresenterPasscode(
  enteredCode: string | null | undefined,
  activePasskey?: string | null
): boolean {
  if (!enteredCode) return false;
  const clean = enteredCode.trim().toUpperCase();
  const currentPasskey = (activePasskey || getStoredHostPasskey()).trim().toUpperCase();
  return clean === currentPasskey;
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
