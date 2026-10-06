import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { createQueryClient } from "../lib/queryClient/queryClient";

// Fresh client per test so cache never leaks between tests; no retries so
// error states show up immediately instead of after 3 attempts.
// Uses the app's real client factory, so global error toasts are tested too.
export function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        {ui}
        <Toaster />
      </QueryClientProvider>,
    ),
  };
}

// src/test/utils.tsx:
// renderWithProviders gives each test a fresh React Query client with retries off.
//  That way one test's cached data can't leak into the next, and error states appear
// straight away
