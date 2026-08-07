export function BlackDiamond({
  className = "",
  title = "VOID",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.55)] ${className}`}
      title={title}
      aria-label={title}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l3.2 5.2L22 9.2l-5 4.8L18.4 22 12 18.6 5.6 22 7 14 2 9.2l6.8-2L12 2z" />
      </svg>
    </span>
  );
}
