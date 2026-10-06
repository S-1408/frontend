import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { toast } from "sonner";
import { server } from "./server";

// Fail loudly if a component calls an endpoint we forgot to mock
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  // Toasts live in global state and a new <Toaster> replays active ones,
  // so clear them or one test's toast shows up in the next
  toast.dismiss();
  cleanup();
});
afterAll(() => server.close());


// loads the extra assertions such as toBeDisabled,
//  and starts MSW, which fakes the backend.
//   If a component calls an endpoint the test didn't mock, the test fails.