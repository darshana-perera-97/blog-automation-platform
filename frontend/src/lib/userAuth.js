const USER_SESSION_KEY = "aiBlogerUserId";

export function setUserSession(userId) {
  localStorage.setItem(USER_SESSION_KEY, String(userId));
}

export function clearUserSession() {
  localStorage.removeItem(USER_SESSION_KEY);
}

export function getUserSessionId() {
  return localStorage.getItem(USER_SESSION_KEY);
}

export function isUserAuthenticated() {
  return Boolean(getUserSessionId());
}
