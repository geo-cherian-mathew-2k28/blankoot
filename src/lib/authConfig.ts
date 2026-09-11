// Dual-Mode Presenter Authentication Engine
// Supports both:
// 1. Quick Master Passcode (for classroom smartboards & projectors without exposing personal Google accounts)
// 2. Google OAuth Single Sign-On (for personal laptops)

export const AUTHORIZED_HOST_EMAILS = [
  "blankspacecommunity@gmail.com",
];

export const DEFAULT_PRESENTER_PASSCODES = [
  "BLANK2026",
  "BLANKSPACE",
  "HOST2026",
];

export function validatePresenterPasscode(code: string | null | undefined): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();

  const envPass = import.meta.env.VITE_PRESENTER_PASSCODE;
  if (envPass && envPass.trim().toUpperCase() === clean) return true;

  return DEFAULT_PRESENTER_PASSCODES.includes(clean);
}

export function isAuthorizedHost(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // Also check environment variable if configured
  const envHosts = import.meta.env.VITE_HOST_EMAILS;
  if (envHosts) {
    const list = envHosts.split(',').map((e: string) => e.trim().toLowerCase());
    if (list.includes(normalized)) return true;
  }
  
  return AUTHORIZED_HOST_EMAILS.some((e) => e.toLowerCase() === normalized);
}

