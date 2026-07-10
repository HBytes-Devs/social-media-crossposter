import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { PostTab } from "../../store/slices/postsSlice";

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
  return (
    <Tabs
      value={activeTab}
      onChange={(_, value) => onChange(value as PostTab)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        minHeight: 68,
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px 3px 0 0",
          transition: "left 0.25s ease, width 0.25s ease",
        },
        "& .MuiTab-root": {
          alignItems: "flex-start",
          textTransform: "none",
          minHeight: 68,
          px: 2,
          py: 1.5,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          disabled={disabled}
          disableRipple
          label={
            <Box sx={{ width: "100%", textAlign: "left" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                  {tab.label}
                </Typography>
                <Chip
                  label={counts[tab.id]}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 28,
                    fontSize: 11,
                    fontWeight: 700,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block", lineHeight: 1.3 }}
              >
                {tab.description}
              </Typography>
            </Box>
          }
        />
      ))}
    </Tabs>
  );
}

export const POST_TABS = TABS;
