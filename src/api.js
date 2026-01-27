const API_BASE =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "/api" : "");

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const csrf = getCookie("csrf_token");

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && csrf) {
    finalHeaders["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    // Prefer backend-provided message
    let msg =
      typeof data === "object" && data?.error
        ? data.error
        : `Request failed (${res.status})`;

    // Add clearer messages for common security responses
    if (res.status === 401) msg = msg || "Authentication required. Please login.";
    if (res.status === 403) msg = msg || "Forbidden. You don't have permission for this action.";
    if (res.status === 429) msg = msg || "Too many requests. Please slow down and try again.";

    const err = new Error(msg);
    err.status = res.status;   // helpful if you want custom UI later
    err.payload = data;        // optional debugging
    throw err;
  }

  return data;
}
