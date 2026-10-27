import { useEffect, useState } from "react";

export default function Kpi({ label, value, accent = "text-paper-100", helperText }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const match = String(value).match(/^(.*?)(-?[\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return undefined;
    }

    const target = Number(match[2].replace(/,/g, ""));
    const decimalPlaces = (match[2].split(".")[1] || "").length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !Number.isFinite(target)) {
      setDisplayValue(value);
      return undefined;
    }

    const startedAt = performance.now();
    let frame;
    function animate(now) {
      const progress = Math.min(1, (now - startedAt) / 480);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplayValue(`${match[1]}${current.toLocaleString("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })}${match[3]}`);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="surface-elevated interactive-surface min-w-0 rounded-lg border border-ink-700/60 bg-ink-900 px-4 py-5 sm:px-5">
      <p className="mb-2 text-xs text-paper-400">{label}</p>
      <p className={`break-words font-display text-xl font-semibold font-tabular sm:text-2xl ${accent}`}>{displayValue}</p>
      {helperText && <p className="mt-2 text-xs leading-relaxed text-paper-400">{helperText}</p>}
    </div>
  );
}
