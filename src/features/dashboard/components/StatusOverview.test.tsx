import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import StatusOverview from "./StatusOverview";
import { server } from "../../../test/server";
import { renderWithProviders } from "../../../test/utils";
import { clearAccessToken, setAccessToken } from "../../auth/authTokens";

beforeEach(() => {
  setAccessToken("stats-access-token");
});

afterEach(() => {
  clearAccessToken();
});

describe("application stats", () => {
  it("loads status counts from the protected stats endpoint", async () => {
    let authorization: string | null = null;
    server.use(
      http.get("*/stats", ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json({
          total: 2,
          byStatus: { applied: 1, interview: 1, offer: 0, rejected: 0 },
        });
      }),
    );

    renderWithProviders(<StatusOverview />);

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(await screen.findAllByText("1")).toHaveLength(2);
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(authorization).toBe("Bearer stats-access-token");
  });

  it("shows a clear error when the stats request fails", async () => {
    server.use(
      http.get("*/stats", () => HttpResponse.json({ message: "Stats unavailable" }, { status: 500 })),
    );

    renderWithProviders(<StatusOverview />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load application stats.");
  });
});
