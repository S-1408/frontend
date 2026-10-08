import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { routes } from "../../../app/router";
import AppLayout from "../../../app/AppLayout";
import AppCrashFallback from "./AppCrashFallback";
import RouterErrorPage from "./RouterErrorPage";
import SectionErrorBoundary from "./SectionErrorBoundary";

// A component that throws while rendering, like a real bug would
// (e.g. calling .charAt on a null company name)
let shouldThrow = true;
const Bomb = () => {
  if (shouldThrow) throw new Error("Boom: company is null");
  return <p>Recovered content</p>;
};

beforeEach(() => {
  shouldThrow = true;
  // React logs every caught error; silence it so test output stays readable
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("SectionErrorBoundary", () => {
  // Why: the whole point of widget-level boundaries. One broken section must
  // not blank out the rest of the page.
  it("shows the fallback and keeps sibling content working", () => {
    render(
      <>
        <h1>Page heading</h1>
        <SectionErrorBoundary name="test-section" title="Couldn't display your applications.">
          <Bomb />
        </SectionErrorBoundary>
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't display your applications.",
    );
    expect(screen.getByRole("heading", { name: "Page heading" })).toBeInTheDocument();
  });

  // Why: a fallback with no way out is a dead end. "Try again" must re-render
  // the children once the cause (e.g. bad data) is gone.
  it("recovers when the user clicks Try again", async () => {
    const user = userEvent.setup();
    render(
      <SectionErrorBoundary name="test-section">
        <Bomb />
      </SectionErrorBoundary>,
    );

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Why: raw error messages can leak internals (URLs, IDs, stack hints) and
  // mean nothing to users. Developers still need them locally.
  it("shows the error message only in development", () => {
    vi.stubEnv("DEV", false);
    render(
      <SectionErrorBoundary name="test-section">
        <Bomb />
      </SectionErrorBoundary>,
    );
    expect(screen.queryByText(/Boom/)).not.toBeInTheDocument();
  });
});

describe("Route error handling", () => {
  // Why: a crash inside a page should render inside the layout's <Outlet>, so
  // the header and sidebar remain usable and the user can navigate away.
  it("renders a page crash inside the layout, keeping navigation usable", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <AppLayout />,
          errorElement: <RouterErrorPage />,
          children: [{ errorElement: <RouterErrorPage />, children: [{ index: true, element: <Bomb /> }] }],
        },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("link", { name: "Applications" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Dashboard" })).toHaveAttribute("href", "/");
  });

  // Why: uses the REAL route config, so it fails if someone removes the
  // catch-all route. Sidebar links like /settings don't exist yet.
  it("shows a 404 page inside the layout for unknown URLs", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/settings"] });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Applications" })).toBeInTheDocument();
  });
});

describe("AppCrashFallback", () => {
  // Why: the outermost safety net. If the router or providers crash, users
  // get a recoverable screen instead of a blank white page.
  it("replaces a crashed app with a reload screen", () => {
    render(
      <ErrorBoundary FallbackComponent={AppCrashFallback}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });
});
