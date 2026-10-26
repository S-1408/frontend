import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Tests register their own handlers with server.use(...)
export const server = setupServer(
  http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
  http.get("*/stats", () => HttpResponse.json({
    total: 0,
    byStatus: { applied: 0, interview: 0, offer: 0, rejected: 0 },
  })),
  http.get("*/auth/me", () => HttpResponse.json({
    id: "test-user",
    name: "Test User",
    email: "test@example.com",
  })),
);
