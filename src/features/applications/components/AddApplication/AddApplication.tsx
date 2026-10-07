import { useForm } from "react-hook-form";
import type { CreateApplicationPayload } from "../../types/types";
import { APPLICATION_STATUS_OPTIONS } from "../../constants/status";
import { styles } from "./AddApplication.styles";

export type ApplicationFormValues = CreateApplicationPayload;

interface AddApplicationProps {
  formId: string;
  onSubmit: (data: ApplicationFormValues) => void;
  defaultValues?: Partial<ApplicationFormValues>;
  disabled?: boolean;
}

const trim = (value: string) => value.trim();
// Local date as YYYY-MM-DD, matching the native date input format
const today = () => new Date().toLocaleDateString("en-CA");

const AddApplication = ({
  formId,
  onSubmit,
  defaultValues,
  disabled = false,
}: AddApplicationProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    defaultValues: { status: "applied", ...defaultValues },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Disabling the fieldset locks every input while the request is in flight */}
      <fieldset disabled={disabled} className="contents">
      <div className={styles.field}>
        <label htmlFor="company">Company</label>
        <input
          id="company"
          className={styles.input}
          {...register("company", {
            setValueAs: trim,
            required: "Company is required",
            maxLength: { value: 100, message: "Max 100 characters" },
          })}
        />
        {errors.company && (
          <p className={styles.error}>{errors.company.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="role">Role</label>
        <input
          id="role"
          className={styles.input}
          {...register("role", {
            setValueAs: trim,
            required: "Role is required",
            maxLength: { value: 100, message: "Max 100 characters" },
          })}
        />
        {errors.role && <p className={styles.error}>{errors.role.message}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="status">Status</label>
        <select id="status" className={styles.input} {...register("status")}>
          {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="appliedAt">Applied Date</label>
        <input
          id="appliedAt"
          type="date"
          max={today()}
          className={styles.input}
          {...register("appliedAt", {
            required: "Applied date is required",
            validate: (value) =>
              value <= today() || "Applied date cannot be in the future",
          })}
        />
        {errors.appliedAt && (
          <p className={styles.error}>{errors.appliedAt.message}</p>
        )}
      </div>
      </fieldset>
    </form>
  );
};

export default AddApplication;
