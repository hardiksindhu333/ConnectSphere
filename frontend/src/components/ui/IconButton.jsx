export default function IconButton({
  children,
  onClick,
  disabled,
  className = "",
  title,
  type = "button",
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-full",
        "bg-white/5 hover:bg-white/10 active:bg-white/15",
        "border border-white/10 transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

