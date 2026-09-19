export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
