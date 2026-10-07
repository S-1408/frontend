import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import * as Sentry from "@sentry/react";
import { server } from "../../../test/server";
import { renderWithProviders } from "../../../test/utils";
import { apiClient } from "../../../lib/apiClient/apiClient";
import { reportError } from "../../../lib/monitoring/reportError";
import SectionBoundary from "./SectionBoundary";

vi.mock("@sentry/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@sentry/react")>()),
  captureException: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(Sentry.captureException).mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const Bomb = () => {
  throw new Error("Boom");
};

describe("SectionBoundary reporting", () => {
  // Why: the section name tells you WHICH widget breaks in production. Also
  // guards against double reporting: the root onCaughtError is the only
  // reporter, the boundary just tags. Uses the same root option as main.tsx.
  it("reports a caught error to Sentry once, tagged with the section name", () => {
    render(
      <SectionBoundary name="revenue-chart">
        <Bomb />
      </SectionBoundary>,
      { onCaughtError: reportError },
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Boom" }),
      expect.objectContaining({ tags: { section: "revenue-chart" } }),
    );
  });
});

describe("SectionBoundary with Suspense", () => {
  const Stats = () => {
    const { data } = useSuspenseQuery({
      queryKey: ["stats"],
      queryFn: () => apiClient.get<{ total: number }>("/stats").then((r) => r.data),
    });
    return <p>Total: {data.total}</p>;
  };

  // Why: without QueryErrorResetBoundary, Try again re-throws the cached
  // error and the fallback never goes away. This proves Retry really refetches.
  it("shows the skeleton, then the fallback, and Try again refetches", async () => {
    server.use(http.get("*/stats", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(
      <SectionBoundary name="stats" loadingFallback={<p>Loading stats…</p>}>
        <Stats />
      </SectionBoundary>,
    );

    expect(screen.getByText("Loading stats…")).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    server.use(http.get("*/stats", () => HttpResponse.json({ total: 7 })));
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Total: 7")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
