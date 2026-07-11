import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PageHeaderButton } from "../ui/PageHeaderButton";
import { usePostsTheme } from "./postsTheme";

type Props = {
  onNewPost: () => void;
};

export function PostsPageHeader({ onNewPost }: Props) {
  const { colors, fonts } = usePostsTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 3.25,
        gap: 2.5,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: fonts.heading,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.4px",
            lineHeight: 1.15,
          }}
        >
          Posts
        </Typography>
        <Typography
          sx={{
            color: colors.muted,
            fontSize: 13.5,
            mt: 0.75,
            fontFamily: fonts.body,
            lineHeight: 1.45,
          }}
        >
          Published, drafts, trash — sab manage yahan
        </Typography>
      </Box>
      <PageHeaderButton
        variant="primary"
        onClick={onNewPost}
        startIcon={<AddIcon sx={{ fontSize: 14 }} />}
        sx={{ flexShrink: 0 }}
      >
        New post
      </PageHeaderButton>
    </Box>
  );
}
