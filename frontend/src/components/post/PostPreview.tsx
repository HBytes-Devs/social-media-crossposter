type Props = {
  finalContent: string;
  hashtags: string[];
  loading?: boolean;
};

export function PostPreview({ finalContent, hashtags, loading }: Props) {
  return (
    <div className="space-y-4">
      <div className="min-h-[160px] rounded-xl border border-slate-700 bg-slate-950 p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Preview loading...</p>
        ) : finalContent ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {finalContent}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Yahan final post preview dikhega...</p>
        )}
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-brand-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
