const WEBSITE_SCOPE_KEY = "aiBlogerSelectedWebsiteId";
const WEBSITE_SCOPE_EVENT = "aiBloger:website-scope-changed";

export function getSelectedWebsiteScope() {
  return localStorage.getItem(WEBSITE_SCOPE_KEY) || "";
}

export function setSelectedWebsiteScope(websiteId) {
  if (!websiteId) {
    localStorage.removeItem(WEBSITE_SCOPE_KEY);
    window.dispatchEvent(new CustomEvent(WEBSITE_SCOPE_EVENT, { detail: { websiteId: "" } }));
    return;
  }
  localStorage.setItem(WEBSITE_SCOPE_KEY, String(websiteId));
  window.dispatchEvent(new CustomEvent(WEBSITE_SCOPE_EVENT, { detail: { websiteId: String(websiteId) } }));
}

export function subscribeWebsiteScope(handler) {
  const wrapped = (event) => {
    handler(event?.detail?.websiteId || getSelectedWebsiteScope());
  };
  window.addEventListener(WEBSITE_SCOPE_EVENT, wrapped);
  return () => {
    window.removeEventListener(WEBSITE_SCOPE_EVENT, wrapped);
  };
}
