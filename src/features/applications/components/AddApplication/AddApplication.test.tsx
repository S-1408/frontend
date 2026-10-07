import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddApplication, { type ApplicationFormValues } from "./AddApplication";

const FORM_ID = "test-form";
const TODAY = "2026-10-05";

// In the app the submit button lives in the modal footer and points at the
// form via the `form` attribute, so the test mirrors that wiring
function setup(props: Partial<React.ComponentProps<typeof AddApplication>> = {}) {
  const onSubmit = vi.fn<(data: ApplicationFormValues) => void>();
  render(
    <>
      <AddApplication formId={FORM_ID} onSubmit={onSubmit} {...props} />
      <button type="submit" form={FORM_ID}>
        Add
      </button>
    </>,
  );
  return { user: userEvent.setup(), onSubmit };
}

const fields = () => ({
  company: screen.getByLabelText(/company/i),
  role: screen.getByLabelText(/role/i),
  status: screen.getByLabelText(/status/i),
  appliedAt: screen.getByLabelText(/applied date/i),
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  const f = fields();
  await user.type(f.company, "Google");
  await user.type(f.role, "Frontend Developer");
  await user.selectOptions(f.status, "interview");
  await user.type(f.appliedAt, "2026-09-01");
}

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Add" }));

describe("AddApplication", () => {
  // Freeze only Date (not timers) so "today" is deterministic and
  // user-event's internal timers still run normally
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(`${TODAY}T12:00:00`));
  });
  afterEach(() => vi.useRealTimers());

  describe("rendering", () => {
    // Why: every input must be reachable by its label. If this fails, screen
    // readers can't announce the field and clicking the label won't focus it.
    it("renders every field with an accessible label", () => {
      setup();
      const f = fields();
      expect(f.company).toBeInTheDocument();
      expect(f.role).toBeInTheDocument();
      expect(f.status).toBeInTheDocument();
      expect(f.appliedAt).toHaveAttribute("type", "date");
    });

    // Why: option values are sent to the API, so they must exactly match
    // ApplicationStatus. This is the test that catches typos like "interviewing".
    it("defaults status to Applied and lists every status option", () => {
      setup();
      expect(fields().status).toHaveValue("applied");
      expect(
        screen.getAllByRole("option").map((o) => o.getAttribute("value")),
      ).toEqual(["applied", "interview", "offer", "rejected"]);
    });

    // Why: `max` stops the native date picker offering future dates, so most
    // users never even see the validation error.
    it("prevents picking a future date in the date picker", () => {
      setup();
      expect(fields().appliedAt).toHaveAttribute("max", TODAY);
    });

    // Why: an edit form will reuse this component; if defaultValues are ignored,
    // editing would show an empty form and overwrite real data.
    it("prefills fields from defaultValues", () => {
      setup({
        defaultValues: { company: "Meta", role: "SDE", status: "offer" },
      });
      const f = fields();
      expect(f.company).toHaveValue("Meta");
      expect(f.role).toHaveValue("SDE");
      expect(f.status).toHaveValue("offer");
    });
  });

  describe("submitting", () => {
    // Why: the core contract. toEqual (not toHaveBeenCalled) guarantees no field
    // is missing, renamed or extra in what the backend receives.
    it("submits the exact payload the API expects", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await submit(user);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toEqual({
        company: "Google",
        role: "Frontend Developer",
        status: "interview",
        appliedAt: "2026-09-01",
      });
    });

    // Why: without trimming, "Google" and "Google " are stored as different
    // companies, breaking search, sorting and duplicate checks.
    it("trims surrounding whitespace before submitting", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await user.clear(fields().company);
      await user.type(fields().company, "   Google   ");
      await submit(user);

      expect(onSubmit.mock.calls[0][0]).toMatchObject({ company: "Google" });
    });

    // Why: off-by-one bugs live at boundaries. Applying today is the most common
    // case, and a `<` instead of `<=` would wrongly reject it.
    it("accepts today's date (boundary)", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await user.clear(fields().appliedAt);
      await user.type(fields().appliedAt, TODAY);
      await submit(user);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("validation", () => {
    // Why: checks both halves of validation: the user sees what's wrong AND no
    // invalid request is sent. Showing errors but still submitting is a real bug.
    it("shows every required error and does not submit an empty form", async () => {
      const { user, onSubmit } = setup();
      await submit(user);

      expect(await screen.findByText("Company is required")).toBeInTheDocument();
      expect(screen.getByText("Role is required")).toBeInTheDocument();
      expect(screen.getByText("Applied date is required")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Why: plain `required` accepts "   ". Only trimming before validation stops
    // blank-looking records reaching the database.
    it("rejects whitespace-only company and role", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await user.clear(fields().company);
      await user.type(fields().company, "    ");
      await user.clear(fields().role);
      await user.type(fields().role, "    ");
      await submit(user);

      expect(await screen.findByText("Company is required")).toBeInTheDocument();
      expect(screen.getByText("Role is required")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Why: tests both sides of the edge (101 fails, 100 passes) so the limit is
    // neither missing nor off by one. Long values can break the table layout or DB column.
    it("enforces the 100 character limit (boundary)", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await user.clear(fields().company);
      // Paste instead of typing 101 keystrokes: same result, much faster
      await user.click(fields().company);
      await user.paste("a".repeat(101));
      await submit(user);

      expect(await screen.findByText("Max 100 characters")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();

      await user.type(fields().company, "{Backspace}");
      await submit(user);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // Why: you can't have applied in the future. `max` only restricts the picker;
    // typed or pasted dates must still be caught by validation.
    it("rejects a future applied date", async () => {
      const { user, onSubmit } = setup();
      await fillValidForm(user);
      await user.clear(fields().appliedAt);
      await user.type(fields().appliedAt, "2026-10-06");
      await submit(user);

      expect(
        await screen.findByText("Applied date cannot be in the future"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Why: a stale error after the user fixed the input is confusing and makes the
    // form feel broken. Guards react-hook-form's re-validate-on-change behaviour.
    it("clears an error as soon as the user fixes the field", async () => {
      const { user } = setup();
      await submit(user);
      expect(await screen.findByText("Company is required")).toBeInTheDocument();

      await user.type(fields().company, "Google");
      expect(screen.queryByText("Company is required")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    // Why: if the user edits while saving, the screen no longer matches what was
    // sent. Locking the fields keeps what they see equal to what was saved.
    it("locks every field so input can't change mid-request", async () => {
      const { user } = setup({
        disabled: true,
        defaultValues: { company: "Google" },
      });

      Object.values(fields()).forEach((field) => expect(field).toBeDisabled());

      await user.type(fields().company, "XYZ");
      expect(fields().company).toHaveValue("Google");
    });
  });
});
