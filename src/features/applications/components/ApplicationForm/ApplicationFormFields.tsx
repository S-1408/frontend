import { useForm } from "react-hook-form";
import type { ApplicationFormValues } from "../../types";
import { APPLICATION_STATUS_OPTIONS } from "../../constants/status";

type ApplicationFormFieldsProps = {
  formId: string;
  defaultValues?: Partial<ApplicationFormValues>;
  isPending: boolean;
  onSubmit: (values: ApplicationFormValues) => void;
};

const styles = {
  form: "flex w-full flex-col gap-4",
  field: "flex flex-col gap-1",
  input: "w-full rounded-lg bg-gray-100 px-3 py-2",
  error: "text-xs text-red-500",
};

const trim = (value: string) => value.trim();
// Local date as YYYY-MM-DD, matching the native date input format
const today = () => new Date().toLocaleDateString("en-CA");



// Lives inside <Modal>, which renders children only while open. So the form
// mounts fresh on every open and reads defaultValues again: editing a second
// application never shows the first one's values.
const ApplicationFormFields = ({
  formId,
  defaultValues,
  isPending,
  onSubmit,
}: ApplicationFormFieldsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    defaultValues: {
      status: "applied",
      ...defaultValues,
      // API dates may be full ISO strings; <input type="date"> needs YYYY-MM-DD
      appliedAt: defaultValues?.appliedAt?.slice(0, 10),
    },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Disabling the fieldset locks every input while the request is in flight */}
      <fieldset disabled={isPending} className="contents">
        <div className={styles.field}>
          <label htmlFor={`${formId}-company`}>Company</label>
          <input
            id={`${formId}-company`}
            className={styles.input}
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${formId}-company-error` : undefined}
            {...register("company", {
              setValueAs: trim,
              required: "Company is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            })}
          />
          {errors.company && (
            <p id={`${formId}-company-error`} className={styles.error}>
              {errors.company.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor={`${formId}-role`}>Role</label>
          <input
            id={`${formId}-role`}
            className={styles.input}
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? `${formId}-role-error` : undefined}
            {...register("role", {
              setValueAs: trim,
              required: "Role is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            })}
          />
          {errors.role && (
            <p id={`${formId}-role-error`} className={styles.error}>
              {errors.role.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor={`${formId}-status`}>Status</label>
          <select
            id={`${formId}-status`}
            className={styles.input}
            {...register("status")}
          >
            {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${formId}-appliedAt`}>Applied Date</label>
          <input
            id={`${formId}-appliedAt`}
            type="date"
            max={today()}
            className={styles.input}
            aria-invalid={Boolean(errors.appliedAt)}
            aria-describedby={errors.appliedAt ? `${formId}-appliedAt-error` : undefined}
            {...register("appliedAt", {
              required: "Applied date is required",
              validate: (value) =>
                value <= today() || "Applied date cannot be in the future",
            })}
          />
          {errors.appliedAt && (
            <p id={`${formId}-appliedAt-error`} className={styles.error}>
              {errors.appliedAt.message}
            </p>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default ApplicationFormFields