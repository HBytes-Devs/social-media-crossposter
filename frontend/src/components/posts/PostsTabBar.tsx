import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PostTab } from "../../store/slices/postsSlice";
import { usePostsTheme } from "./postsTheme";

const TABS: Array<{ id: PostTab; label: string; description: string }> = [
  { id: "all", label: "All", description: "Saari active posts" },
  { id: "published", label: "Published", description: "Live posts" },
  { id: "scheduled", label: "Scheduled", description: "Queued for later" },
  { id: "drafts", label: "Drafts", description: "Saved drafts" },
  { id: "trashed", label: "Trashed", description: "Deleted posts" },
];

type Props = {
  activeTab: PostTab;
  counts: Record<PostTab, number>;
  onChange: (tab: PostTab) => void;
  disabled?: boolean;
};

export function PostsTabBar({ activeTab, counts, onChange, disabled }: Props) {
  const { colors, fonts } = usePostsTheme();

  return (
    <Box
      sx={{
        display: "flex",
        gap: "2px",
        px: { xs: 1, sm: 2.5 },
        pt: 0.75,
        borderBottom: "1px solid",
        borderColor: colors.line,
        overflowX: "auto",
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <Box
            key={tab.id}
            component="button"
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            sx={{
              border: "none",
              background: "transparent",
              cursor: disabled ? "not-allowed" : "pointer",
              textAlign: "left",
              px: { xs: 1.5, sm: 2.25 },
              py: "14px",
              pb: "16px",
              borderBottom: "2px solid",
              borderBottomColor: active ? colors.accent : "transparent",
              opacity: disabled ? 0.6 : 1,
              transition: "border-color 0.15s ease",
              flexShrink: 0,
              "&:hover .tab-name": {
                color: colors.text,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                className="tab-name"
                sx={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: active ? colors.text : colors.textSoft,
                  fontFamily: fonts.body,
                  lineHeight: 1.2,
                  transition: "color 0.15s ease",
                }}
              >
                {tab.label}
              </Typography>
              <Box
                component="span"
                sx={{
                  fontFamily: fonts.mono,
                  fontSize: 10.5,
                  fontWeight: 600,
                  bgcolor: active ? colors.accentSoft : colors.chipBg,
                  color: active ? colors.accentTag : colors.muted,
                  px: "7px",
                  py: "1.5px",
                  borderRadius: 999,
                  lineHeight: 1.4,
                }}
              >
                {counts[tab.id]}
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: 11,
                color: colors.muted,
                mt: 0.375,
                fontFamily: fonts.body,
                lineHeight: 1.3,
              }}
            >
              {tab.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export const POST_TABS = TABS;
