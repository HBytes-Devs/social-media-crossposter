import { Input } from "../ui/Input";

type Props = {
  title: string;
  subreddit: string;
  onTitleChange: (value: string) => void;
  onSubredditChange: (value: string) => void;
};

export function RedditFields({
  title,
  subreddit,
  onTitleChange,
  onSubredditChange,
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-orange-800/40 bg-orange-950/20 p-4">
      <p className="text-sm font-medium text-orange-200">Reddit options</p>
      <Input
        label="Post title *"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Reddit post ka title"
        maxLength={300}
      />
      <Input
        label="Subreddit *"
        value={subreddit}
        onChange={(e) => onSubredditChange(e.target.value)}
        placeholder="test (bina r/)"
      />
      <p className="text-xs text-slate-500">
        Testing ke liye <code className="text-slate-400">test</code> use karo. Production mein apni
        subreddit likho.
      </p>
    </div>
  );
}
