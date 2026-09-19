export default function Input({
  label,
  id,
  error,
  hint,
  as = "input",
  children,
  className = "",
  ...props
}) {
  const Field = as;
  const control =
    as === "select" ? (
      <Field id={id} className={`field-control ${error ? "has-error" : ""}`} {...props}>
        {children}
      </Field>
    ) : (
      <Field id={id} className={`field-control ${error ? "has-error" : ""}`} {...props} />
    );

  return (
    <label className={`field ${className}`} htmlFor={id}>
      {label && <span className="field-label">{label}</span>}
      {control}
      {error && <span className="field-error">{error}</span>}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
