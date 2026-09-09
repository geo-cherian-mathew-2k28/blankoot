// List of emails authorized to host Blankspace quiz sessions in classes
// You can set additional presenter emails via VITE_HOST_EMAILS environment variable
export const AUTHORIZED_HOST_EMAILS = [
  "blankspacecommunity@gmail.com",
];

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
