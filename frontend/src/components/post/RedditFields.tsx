import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useComposeTheme } from "./composeTheme";

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
  const { colors, fonts, fieldLabelSx } = useComposeTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography component="label" sx={fieldLabelSx}>
          Post title *
        </Typography>
        <Box
          component="input"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
          placeholder="Reddit post title"
          maxLength={300}
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: colors.borderStrong,
            borderRadius: "8px",
            p: "10px 12px",
            fontSize: 13.5,
            fontFamily: fonts.body,
            outline: "none",
            "&:focus": { borderColor: colors.accent },
          }}
        />
      </Box>
      <Box>
        <Typography component="label" sx={fieldLabelSx}>
          Subreddit *
        </Typography>
        <Box
          component="input"
          value={subreddit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubredditChange(e.target.value)}
          placeholder="test (without r/)"
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: colors.borderStrong,
            borderRadius: "8px",
            p: "10px 12px",
            fontSize: 13.5,
            fontFamily: fonts.body,
            outline: "none",
            "&:focus": { borderColor: colors.accent },
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, fontFamily: fonts.body }}>
        For testing use <code>test</code>. In production use your own subreddit.
      </Typography>
    </Box>
  );
}
