import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
import { renderWithProviders } from "../../test/utils";
import * as Sentry from "@sentry/react";
import { apiClient } from "../apiClient/apiClient";

vi.mock("@sentry/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@sentry/react")>()),
  captureException: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(Sentry.captureException).mockClear();
  // reportError logs every failure in dev; keep test output readable
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const DeleteButton = ({ suppress = false }: { suppress?: boolean }) => {
  const { mutate } = useMutation({
    mutationFn: () => apiClient.delete("/applications/1"),
    meta: { errorMessage: "Couldn't delete application.", suppressErrorToast: suppress },
  });
  return <button onClick={() => mutate()}>Delete</button>;
};

describe("global mutation error toasts", () => {
  // Why: new mutations get user-facing errors for free, without each hook
  // remembering to wire up its own toast.
  it("toasts the server's message for any failed mutation", async () => {
    server.use(
      http.delete("*/applications/1", () =>
        HttpResponse.json({ message: "Application not found" }, { status: 404 }),
      ),
    );
    const { user } = renderWithProviders(<DeleteButton />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Application not found")).toBeInTheDocument();
  });

  // Why: never show "undefined" or a blank toast when the server sends no body
  it("falls back to the mutation's errorMessage", async () => {
    server.use(http.delete("*/applications/1", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<DeleteButton />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Couldn't delete application.")).toBeInTheDocument();
  });

  // Why: screens that show the error inline opt out to avoid duplicate messages
  it("does not toast when suppressErrorToast is set", async () => {
    server.use(http.delete("*/applications/1", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<DeleteButton suppress />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    // Let the request settle before asserting nothing appeared
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.queryByText("Couldn't delete application.")).not.toBeInTheDocument();
  });
});

describe("global query error toasts", () => {
  const List = () => {
    const { data, isError, refetch } = useQuery({
      queryKey: ["items"],
      queryFn: () => apiClient.get<string[]>("/items").then((r) => r.data),
    });
    return (
      <>
        {isError && !data && <p>Inline load error</p>}
        {data?.map((item) => <p key={item}>{item}</p>)}
        <button onClick={() => refetch()}>Refresh</button>
      </>
    );
  };

  // Why: a first-load failure is shown by the component itself; a toast on top
  // would duplicate it.
  it("does not toast when the first load fails", async () => {
    server.use(http.get("*/items", () => HttpResponse.json({ message: "Boom" }, { status: 500 })));
    renderWithProviders(<List />);

    expect(await screen.findByText("Inline load error")).toBeInTheDocument();
    expect(screen.queryByText("Boom")).not.toBeInTheDocument();
  });

  // Why: when a refresh fails the old data stays on screen, so without a toast
  // the user would never know they're looking at stale data.
  it("toasts when a background refetch fails and keeps the old data", async () => {
    server.use(http.get("*/items", () => HttpResponse.json(["Amazon"])));
    const { user } = renderWithProviders(<List />);
    expect(await screen.findByText("Amazon")).toBeInTheDocument();

    server.use(http.get("*/items", () => HttpResponse.error()));
    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument();
    expect(screen.getByText("Amazon")).toBeInTheDocument();
  });
});

describe("which failures reach Sentry", () => {
  // Why: expected errors (4xx, offline) are normal states the UI explains.
  // Sending them to Sentry buries real bugs in noise and triggers false alerts.
  it.each([
    ["a 404", () => HttpResponse.json({ message: "Application not found" }, { status: 404 }), "Application not found"],
    ["going offline", () => HttpResponse.error(), "Unable to reach the server. Check your connection."],
  ])("shows %s to the user but does not report it", async (_name, resolver, message) => {
    server.use(http.delete("*/applications/1", resolver));
    const { user } = renderWithProviders(<DeleteButton />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  // Why: 5xx means something is broken on our side, which is exactly what monitoring is for
  it("reports a 500 to Sentry", async () => {
    server.use(http.delete("*/applications/1", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<DeleteButton />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Couldn't delete application.")).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
