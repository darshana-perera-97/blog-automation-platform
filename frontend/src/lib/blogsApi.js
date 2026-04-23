const API_BASE = "http://localhost:4321";

export async function fetchBlogSuggestions(userId, payload = {}) {
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to generate blog title suggestions");
  }

  return Array.isArray(result.titles) ? result.titles : [];
}

export async function createBlogFromTitle(userId, payload) {
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create blog");
  }

  return result.blog || null;
}

export async function fetchUserBlogs(userId, websiteId) {
  const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
  const response = await fetch(`${API_BASE}/users/${userId}/blogs${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load blogs");
  }

  return Array.isArray(result.blogs) ? result.blogs : [];
}

export async function fetchUpcomingBlogs(userId, websiteId) {
  const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/upcoming${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load upcoming blogs");
  }

  return result.upcoming || null;
}

export async function fetchBlogsToWrite(userId, websiteId) {
  const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/to-write${query}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load blogs to write");
  }

  return Array.isArray(result.items) ? result.items : [];
}

export async function publishBlog(userId, blogId, payload = {}) {
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/${blogId}/publish`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to publish blog");
  }

  return result.blog || null;
}

export async function unpublishBlog(userId, blogId, payload = {}) {
  const response = await fetch(`${API_BASE}/users/${userId}/blogs/${blogId}/unpublish`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to unpublish blog");
  }

  return result.blog || null;
}
