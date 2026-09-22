const TONES = [
  "#4A5D7A", "#8C2F39", "#5B7A5D", "#C9A227",
  "#5C4A7A", "#3E6B6B", "#8C5A2F", "#6B4A5C",
];

function toneFor(key: string) {
  const sum = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TONES[sum % TONES.length];
}

export function BookSpine({
  id,
  title,
  author,
  coverUrl,
}: {
  id: string;
  title: string;
  author?: string | null;
  coverUrl: string | null;
}) {
  return (
    <div className="group relative flex-shrink-0">
      {coverUrl ? (
        <div className="w-9 h-[150px] rounded-[3px] overflow-hidden transition-transform duration-150 group-hover:-translate-y-2 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={`Cover of ${title}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="w-9 h-[150px] rounded-[3px_3px_2px_2px] flex flex-col items-center justify-end pb-2.5 transition-transform duration-150 group-hover:-translate-y-2 cursor-pointer"
          style={{ background: toneFor(id) }}
        >
          <span
            className="text-[9px] font-medium text-paper whitespace-nowrap overflow-hidden max-h-[115px]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Tooltip - appears below the spine, high z-index so nothing can
          sit on top of it. Positioned below (not above) so it never
          collides with a section heading above the shelf row. */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-max max-w-[160px] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 pointer-events-none z-50">
        <div className="w-2 h-2 bg-ink-3 border-t border-l border-line-strong rotate-45 mx-auto -mb-1" />
        <div className="bg-ink-3 border border-line-strong rounded-md px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-paper leading-snug">{title}</p>
          {author && (
            <p className="text-[11px] text-paper-dim leading-snug mt-0.5">
              {author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
