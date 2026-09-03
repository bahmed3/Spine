const MONTH_LABELS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function ReadingRhythmChart({ monthlyCounts }: { monthlyCounts: number[] }) {
  const max = Math.max(1, ...monthlyCounts);
  const currentMonth = new Date().getMonth(); // 0-indexed, only show through this month

  return (
    <div className="bg-ink-2 border border-line rounded-xl p-6">
      <div className="flex items-end gap-2.5 h-24 mb-2.5">
        {monthlyCounts.slice(0, currentMonth + 1).map((count, i) => {
          const heightPct = count === 0 ? 4 : Math.max(8, (count / max) * 100);
          const isPeak = count === max && count > 0;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
            >
              <div
                className={`w-full max-w-[26px] rounded-t-[3px] ${
                  isPeak ? "bg-brass" : "bg-ink-3"
                }`}
                style={{ height: `${heightPct}%` }}
                title={`${count} book${count === 1 ? "" : "s"} finished`}
              />
              <span className="text-[10px] text-paper-dim font-mono">
                {MONTH_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
