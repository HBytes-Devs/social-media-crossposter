import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "warning.main",
        bgcolor: "action.hover",
        p: 2,
      }}
    >
      <Typography variant="subtitle2" color="warning.main">
        Reddit options
      </Typography>
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
      <Typography variant="caption" color="text.secondary">
        Testing ke liye <code>test</code> use karo. Production mein apni subreddit likho.
      </Typography>
    </Box>
  );
}
