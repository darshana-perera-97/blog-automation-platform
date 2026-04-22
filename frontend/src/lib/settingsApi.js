const API_BASE = "http://localhost:4321";

export async function fetchUserSettings(userId, websiteId) {
  const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
  const response = await fetch(`${API_BASE}/users/${userId}/settings${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load settings");
  }

  return result.setting || { userId, frequency: "weekly", featuredImageSize: "1536x1024", blogWordCount: 1200 };
}

export async function saveUserSettings(userId, payload) {
  const response = await fetch(`${API_BASE}/users/${userId}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to save settings");
  }

  return result.setting || null;
}
