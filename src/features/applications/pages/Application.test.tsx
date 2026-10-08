import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { renderWithProviders } from "../../../test/utils";
import type { Application as ApplicationItem } from "../types";
import Application from "./ApplicationPage";

// Integration tests: real page + modal + form + React Query + axios, with
// only the network mocked. These catch wiring bugs unit tests can't.

type User = ReturnType<typeof userEvent.setup>;

let applications: ApplicationItem[];
let postedBodies: unknown[];
let deletedIds:string[];
let patchedBodies: unknown[];
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-05T12:00:00"));

  applications = [
    { id: "1", company: "Amazon", role: "SDE II", status: "applied", appliedAt: "2026-09-20" },
  ];
  postedBodies = [];
  deletedIds=[];
  patchedBodies = [];
  // A tiny in-memory backend so GET reflects what POST created
  server.use(
    http.get("*/applications", () => HttpResponse.json(applications)),
    http.post("*/applications", async ({ request }) => {
      const body = (await request.json()) as Omit<ApplicationItem, "id">;
      postedBodies.push(body);
      const created = { id: String(applications.length + 1), ...body };
      applications = [...applications, created];
      return HttpResponse.json(created, { status: 201 });
    }),
    http.delete("*/applications/:id",({params})=>{
     deletedIds.push(params.id as string);
     applications = applications.filter((a)=>a.id !== params.id);
     return new HttpResponse(null,{status:204})
    }),
    http.patch("*/applications/:id", async ({ params, request }) => {
      const changes = (await request.json()) as Partial<ApplicationItem>;
      patchedBodies.push(changes);
      applications = applications.map((a) => (a.id === params.id ? { ...a, ...changes } : a));
      return HttpResponse.json(applications.find((a) => a.id === params.id));
    }),
  );
});
afterEach(() => vi.useRealTimers());
//openModal,fillAndSubmit-they're shared steps for Less duplication.One place to change.Tests read like a story.They don't hide what's being tested. 
async function openModal(user: User) {
  await user.click(screen.getByRole("button", { name: "Add Application" }));
  return screen.getByRole("dialog");
}

async function fillAndSubmit(user: User, dialog: HTMLElement) {
  const d = within(dialog);
  await user.type(d.getByLabelText(/company/i), "Google");
  await user.type(d.getByLabelText(/role/i), "Frontend Developer");
  await user.type(d.getByLabelText(/applied date/i), "2026-09-01");
  await user.click(d.getByRole("button", { name: "Add" }));
}

// helper function for delete
async function openDeleteConfirm(user:User,company="Amazon"){
await user.click(await screen.findByRole("button",{name:`Delete ${company}`}))
return screen.getByRole("dialog")
}
describe("Create application flow", () => {
  // Why: the full happy path end to end. The final assertion only passes if
  // invalidateQueries refetched the list, so removing it fails this test.
  it("posts the form, closes the modal and shows the new row in the list", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    expect(await screen.findByText("Amazon")).toBeInTheDocument();

    await fillAndSubmit(user, await openModal(user));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(postedBodies).toEqual([
      { company: "Google", role: "Frontend Developer", status: "applied", appliedAt: "2026-09-01" },
    ]);
    // Proves the cache invalidation refetched the list
    expect(await screen.findByText("Google")).toBeInTheDocument();
    // The modal closing alone is easy to miss, so the save is confirmed
    expect(await screen.findByText("Application added")).toBeInTheDocument();
  });

  // Why: create errors are shown inline in the modal. A global error toast on
  // top would show the same message twice (suppressErrorToast in the hook).
  it("shows a create failure inline only, not as a duplicate toast", async () => {
    server.use(
      http.post("*/applications", () =>
        HttpResponse.json({ message: "Application already exists" }, { status: 409 }),
      ),
    );
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);

    await fillAndSubmit(user, dialog);

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Application already exists");
    expect(screen.getAllByText("Application already exists")).toHaveLength(1);
    expect(screen.queryByText("Application added")).not.toBeInTheDocument();
  });

  // Why: invalid input must never reach the server, and the modal must stay open
  // so the user can fix it.
  it("does not call the API when validation fails", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);

    await user.click(within(dialog).getByRole("button", { name: "Add" }));

    expect(await within(dialog).findByText("Company is required")).toBeInTheDocument();
    expect(postedBodies).toHaveLength(0);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Why: guards the original bug where the modal closed before the request
  // finished, silently losing the user's input on failure.
  it("shows the server's error message and keeps the user's input", async () => {
    server.use(
      http.post("*/applications", () =>
        HttpResponse.json({ message: "Application already exists" }, { status: 409 }),
      ),
    );
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);

    await fillAndSubmit(user, dialog);

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Application already exists",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/company/i)).toHaveValue("Google");
  });

  // Why: servers don't always send a body (proxies, crashes). The user should
  // still see a readable message, never a blank or "undefined".
  it("shows a fallback message when the server sends no message", async () => {
    server.use(http.post("*/applications", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);

    await fillAndSubmit(user, dialog);

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Failed to add application.",
    );
  });

  // Why: offline or server down has no HTTP response at all; telling the user
  // to check their connection is more useful than a generic error.
  it("shows a connectivity message on network failure", async () => {
    server.use(http.post("*/applications", () => HttpResponse.error()));
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);

    await fillAndSubmit(user, dialog);

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Unable to reach the server",
    );
  });

  // Why: double clicks create duplicate applications, and closing mid-request
  // hides the result. Asserting exactly one POST proves the guard works.
  it("locks the form while saving and can't be closed or double-submitted", async () => {
    // Hold the request open until we release it
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post("*/applications", async ({ request }) => {
        postedBodies.push(await request.json());
        await gate;
        return HttpResponse.json({ id: "9" }, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openModal(user);
    const d = within(dialog);

    await fillAndSubmit(user, dialog);

    const submitBtn = await d.findByRole("button", { name: "Adding..." });
    expect(submitBtn).toBeDisabled();
    expect(d.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(d.getByLabelText(/company/i)).toBeDisabled();

    await user.click(submitBtn);
    await user.keyboard("{Escape}");
    await user.click(d.getByRole("button", { name: "Close" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(postedBodies).toHaveLength(1);

    release();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  // Why: an error from a previous attempt showing on a fresh form is confusing.
  // Checks that handleClose resets the mutation state and the form remounts.
  it("cancelling sends nothing, and reopening starts with a clean form and no old error", async () => {
    server.use(
      http.post("*/applications", () =>
        HttpResponse.json({ message: "Server exploded" }, { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    let dialog = await openModal(user);
    await fillAndSubmit(user, dialog);
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    dialog = await openModal(user);
    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText(/company/i)).toHaveValue("");
  });
});

describe("Delete application", () => {
  // Why: the happy path. The row only disappears if the list was invalidated and refetched.
  it("deletes after confirming and removes the row", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openDeleteConfirm(user);

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(deletedIds).toEqual(["1"]);
    await waitFor(() => expect(screen.queryByText("Amazon")).not.toBeInTheDocument());
    expect(await screen.findByText("Application deleted")).toBeInTheDocument();
  });

  // Why: cancelling must never send a request.
  it("cancel closes the dialog without deleting", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openDeleteConfirm(user);

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deletedIds).toHaveLength(0);
    expect(screen.getByText("Amazon")).toBeInTheDocument();
  });

  // Why: focus starts on the safe choice, and returns to where the user was.
  it("focuses Cancel on open and returns focus to the row button on close", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openDeleteConfirm(user);

    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Delete Amazon" })).toHaveFocus();
  });

  // Why: a failed delete must not remove the row or close the dialog.
  it("shows an error and keeps the row when the delete fails", async () => {
    server.use(http.delete("*/applications/:id", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openDeleteConfirm(user);

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Couldn't delete application.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Amazon")).toBeInTheDocument();
  });
});

describe("Application list load", () => {
  // Why: a failed load is an expected state, so it must explain itself and
  // offer a way out inline instead of a dead-end "Something went wrong".
  it("explains a failed load and recovers on Retry", async () => {
    server.use(http.get("*/applications", () => HttpResponse.error()));
    const { user } = renderWithProviders(<Application />, { route: "/applications" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to reach the server");

    server.use(http.get("*/applications", () => HttpResponse.json(applications)));
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Amazon")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// helper for edit
async function openEditModal(user: User, company = "Amazon") {
  await user.click(await screen.findByRole("button", { name: `Edit ${company}` }));
  return screen.getByRole("dialog");
}

describe("Edit application", () => {
  // Why: editing starts from the row's real values; an empty form would
  // overwrite real data on save.
  it("opens the form pre-filled with the row's values", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const d = within(await openEditModal(user));

    expect(d.getByLabelText(/company/i)).toHaveValue("Amazon");
    expect(d.getByLabelText(/role/i)).toHaveValue("SDE II");
    expect(d.getByLabelText(/status/i)).toHaveValue("applied");
    expect(d.getByLabelText(/applied date/i)).toHaveValue("2026-09-20");
  });

  // Why: the happy path. The new role only shows if the list was invalidated.
  it("saves changes, closes the modal and updates the row", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const d = within(await openEditModal(user));

    await user.clear(d.getByLabelText(/role/i));
    await user.type(d.getByLabelText(/role/i), "Senior SDE");
    await user.click(d.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(patchedBodies).toEqual([expect.objectContaining({ role: "Senior SDE" })]);
    expect(await screen.findByText("Senior SDE")).toBeInTheDocument();
    expect(await screen.findByText("Application updated")).toBeInTheDocument();
  });

  // Why: a failed save must keep the user's edits and explain what went wrong.
  it("shows a server error inline and keeps the edits", async () => {
    server.use(http.patch("*/applications/:id", () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    const dialog = await openEditModal(user);
    const d = within(dialog);

    await user.clear(d.getByLabelText(/role/i));
    await user.type(d.getByLabelText(/role/i), "Senior SDE");
    await user.click(d.getByRole("button", { name: "Save" }));

    expect(await d.findByRole("alert")).toHaveTextContent("Couldn't save changes.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(d.getByLabelText(/role/i)).toHaveValue("Senior SDE");
  });

  // Why: cancelling must discard edits; reopening shows the saved values, no old error.
  it("cancel discards edits and reopening shows the original values", async () => {
    const { user } = renderWithProviders(<Application />, { route: "/applications" });
    let d = within(await openEditModal(user));
    await user.clear(d.getByLabelText(/role/i));
    await user.type(d.getByLabelText(/role/i), "Changed");
    await user.click(d.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(patchedBodies).toHaveLength(0);

    d = within(await openEditModal(user));
    expect(d.getByLabelText(/role/i)).toHaveValue("SDE II");
  });
});
