const JSON_HEADERS = {
  "Content-Type": "application/json"
};

export async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      headers: {
        ...JSON_HEADERS,
        ...options.headers
      },
      ...options
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection and try again.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "The request could not be completed.");
  }

  return payload;
}

export const tasksApi = {
  getAll() {
    return request("/api/tasks");
  },
  create(title) {
    return request("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title })
    });
  },
  update(taskId, updates) {
    return request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  },
  remove(taskId) {
    return request(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });
  }
};
