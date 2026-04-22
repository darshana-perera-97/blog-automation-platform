const API_BASE = "http://localhost:4321";

export async function fetchUserWebsites(userId) {
  const response = await fetch(`${API_BASE}/users/${userId}/websites`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load websites");
  }

  return Array.isArray(result.websites) ? result.websites : [];
}

export async function createUserWebsite(userId, payload) {
  const response = await fetch(`${API_BASE}/users/${userId}/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to add website");
  }

  return result.website;
}
