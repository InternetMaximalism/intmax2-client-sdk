interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "success" | "danger" | "warning";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  isLoading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed relative";
  const variantStyles = {
    default:
      "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    success:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    danger: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    warning:
      "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      <span className={isLoading ? "invisible" : "visible"}>{children}</span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}
