const API_BASE = "http://localhost:4321";

export async function fetchUserPrompt(userId, websiteId) {
  const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
  const response = await fetch(`${API_BASE}/users/${userId}/prompts${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load prompt");
  }

  return result.prompt || null;
}

export async function saveUserPrompt(userId, payload) {
  const response = await fetch(`${API_BASE}/users/${userId}/prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to save prompt");
  }

  return result.prompt || null;
}
