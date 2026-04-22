const ADMIN_SESSION_KEY = "aiBlogerAdminSession";

export function setAdminSession() {
  localStorage.setItem(ADMIN_SESSION_KEY, "1");
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}
