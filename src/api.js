const API_BASE = "http://127.0.0.1:5002";

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
    const msg = typeof data === "object" && data?.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
