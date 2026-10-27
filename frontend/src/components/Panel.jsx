export default function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`surface-elevated min-w-0 rounded-lg border border-ink-700/60 bg-ink-900 transition-colors hover:border-ink-600/80 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700/60">
          {title && <h3 className="font-display text-base text-paper-100">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
