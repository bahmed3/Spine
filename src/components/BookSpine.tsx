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
  coverUrl,
}: {
  id: string;
  title: string;
  coverUrl: string | null;
}) {
  if (coverUrl) {
    return (
      <div className="flex-shrink-0 w-[70px] h-[150px] rounded-[3px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`Cover of ${title}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 w-8 h-[145px] rounded-[3px_3px_2px_2px] flex flex-col items-center justify-end pb-2.5"
      style={{ background: toneFor(id) }}
      title={title}
    >
      <span
        className="text-[9px] font-medium text-paper whitespace-nowrap overflow-hidden max-h-[115px]"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {title}
      </span>
    </div>
  );
}
