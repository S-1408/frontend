import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import { routes } from "./router";
import AppLayout from "./AppLayout";
import RouterErrorPage from "../shared/components/ErrorBoundary/RouterErrorPage";

beforeEach(() => {
  server.use(http.get("*/applications", () => HttpResponse.json([])));
});
afterEach(() => vi.restoreAllMocks());

describe("lazy-loaded pages", () => {
  // Why: on first visit the page file is still downloading. The layout must
  // show straight away with a loader in the content area, never a blank app.
  // Uses the REAL route config, so removing HydrateFallback fails this test.
  it("shows the layout with a loader, then the lazy page", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole("status", { name: "Loading page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: /Applications/ })).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading page" })).not.toBeInTheDocument();
    expect(warn).not.toHaveBeenCalledWith(expect.stringMatching(/HydrateFallback/));
  });

  // Why: the landing page is eager to avoid a request waterfall, so it must
  // render immediately with no loader.
  it("renders the dashboard immediately, without a loader", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading page" })).not.toBeInTheDocument();
  });

  // Why: after a deploy, old page files are deleted from the server, so an open
  // tab can't load them. Users need "reload for the new version", not a scary
  // generic error.
  it("asks the user to reload when a page file fails to download", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <AppLayout />,
          children: [
            {
              errorElement: <RouterErrorPage />,
              children: [
                {
                  index: true,
                  lazy: () =>
                    Promise.reject(
                      new TypeError("Failed to fetch dynamically imported module: /assets/Dashboard-a1b2.js"),
                    ),
                },
              ],
            },
          ],
        },
      ],
      { initialEntries: ["/"] },
    );
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "A new version is available" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });
});
