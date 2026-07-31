export const ADMIN_COOKIE = "admin_access";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "svembe@gmail.com")
  .trim()
  .toLowerCase();

export function isAuthorized(cookieValue: string | undefined): boolean {
  return !!cookieValue && cookieValue.trim().toLowerCase() === ADMIN_EMAIL;
}
