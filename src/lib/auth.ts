export const tokenKey = "portal_token";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(tokenKey);
};

export const setToken = (token: string) => {
  localStorage.setItem(tokenKey, token);
};

export const clearToken = () => {
  localStorage.removeItem(tokenKey);
};
