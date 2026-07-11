import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { flushComposerDraftToRedux, getComposerDraft, subscribeComposerDraft } from "../../lib/composerDraft";
import { useSyncExternalStore } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectComposer,
  setContent,
  setScheduledForLocal,
  submitPost,
} from "../../store/slices/composerSlice";
import { fetchPostCounts } from "../../store/slices/postsSlice";
import { selectAccounts } from "../../store/slices/accountsSlice";
import { useComposeTheme } from "./composeTheme";
import { SchedulePicker } from "./SchedulePicker";
export function ComposerPublishPanel() {
  const { colors, fonts } = useComposeTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submitLockRef = useRef(false);
  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);

  const {
    accounts,
    selectedAccounts,
    images,
    submitting,
    scheduledForLocal,
  } = useAppSelector(selectComposer);
  const { items: accountsFromSlice } = useAppSelector(selectAccounts);
  const platformAccounts = accounts.length > 0 ? accounts : accountsFromSlice;

  const hasContent = draft.trim().length > 0 || images.length > 0;
  const hasPlatform = selectedAccounts.length > 0;
  const canSubmit = hasContent && hasPlatform && platformAccounts.length > 0 && !submitting;

  async function handleSubmit(mode: "draft" | "publish" | "schedule") {
    if (submitLockRef.current || submitting) return;
    submitLockRef.current = true;
    flushComposerDraftToRedux((value) => dispatch(setContent(value)));

    try {
      const result = await dispatch(submitPost(mode));
      if (submitPost.fulfilled.match(result)) {
        dispatch(fetchPostCounts());
        if (mode === "publish") navigate("/posts/published");
        else if (mode === "schedule") navigate("/posts/scheduled");
        else navigate("/posts/drafts");
      }
    } finally {
      submitLockRef.current = false;
    }
  }

  const note = canSubmit
    ? `Ready to post to ${selectedAccounts.length} platform${selectedAccounts.length > 1 ? "s" : ""}.`
    : "Select at least one platform and add content to enable publishing.";

  const btnBase = {
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: 14,
    fontFamily: fonts.body,
    py: "13px",
    borderRadius: "8px",
    justifyContent: "center",
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <SchedulePicker
          value={scheduledForLocal}
          onChange={(value) => dispatch(setScheduledForLocal(value))}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Button
          fullWidth
          disabled={!canSubmit}
          onClick={() => void handleSubmit("schedule")}
          sx={{
            ...btnBase,
            bgcolor: colors.accent,
            color: "#fff",
            border: "none",
            "&:hover": { bgcolor: colors.accent, opacity: 0.9 },
            "&.Mui-disabled": { opacity: 0.45 },
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Schedule post"}
        </Button>
        <Button
          fullWidth
          disabled={!canSubmit}
          onClick={() => void handleSubmit("publish")}
          sx={{
            ...btnBase,
            bgcolor: colors.accentDark,
            color: "#fff",
            border: "none",
            "&:hover": { bgcolor: "#000" },
            "&.Mui-disabled": { opacity: 0.45 },
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Publish now"}
        </Button>
        <Button
          fullWidth
          disabled={!canSubmit}
          onClick={() => void handleSubmit("draft")}
          sx={{
            ...btnBase,
            bgcolor: colors.surface,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderStrong}`,
            "&:hover": { bgcolor: colors.surface2 },
            "&.Mui-disabled": { opacity: 0.45 },
          }}
        >
          Save as draft
        </Button>
      </Box>

      <Typography
        sx={{
          fontSize: 11.5,
          color: colors.textTertiary,
          textAlign: "center",
          mt: 1.25,
          fontFamily: fonts.body,
        }}
      >
        {note}
      </Typography>
    </>
  );
}
