import { getToken } from "./auth";

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  auth?: boolean;
};

export const apiFetch = async <T>(path: string, options: ApiOptions = {}) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = options.auth ? getToken() : null;

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && data.message) || "Erro na requisição";
    throw new Error(message);
  }

  return data as T;
};
