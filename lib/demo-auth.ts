const DEMO_SESSION_KEY = "sentraclass.demo-session";

// Public, fictional demo credentials. Replace this entire module with server-validated auth.
const DEMO_USERNAME = "demo-admin@sentraclass.local";
const DEMO_PASSWORD = "sentra-demo-only";

export function validateDemoCredentials(username: string, password: string): boolean {
  return username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD;
}

// This tab-scoped marker is only a UI demonstration and grants no API or server protection.
export function hasDemoSession(): boolean {
  return window.sessionStorage.getItem(DEMO_SESSION_KEY) === "active";
}

export function startDemoSession(): void {
  window.sessionStorage.setItem(DEMO_SESSION_KEY, "active");
}

export function endDemoSession(): void {
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
}
