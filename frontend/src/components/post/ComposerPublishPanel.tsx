import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flushComposerDraftToRedux, getComposerDraft, subscribeComposerDraft } from "../../lib/composerDraft";
import { useSyncExternalStore } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectComposer,
  setContent,
  setScheduledForLocal,
  setSelectedAccounts,
  submitPost,
} from "../../store/slices/composerSlice";
import { fetchPostCounts } from "../../store/slices/postsSlice";
import { fetchAccounts, selectAccounts } from "../../store/slices/accountsSlice";
import { selectAuth } from "../../store/slices/authSlice";
import { ConnectionErrorAlert } from "../accounts/ConnectionErrorAlert";
import {
  describeConnectionIssue,
  isAccountConnectionBroken,
  isAuthConnectionError,
} from "../../lib/accountTokenHealth";
import { mergePlatformAccounts, pickDefaultAccountId } from "../../lib/platformAccounts";
import { useComposeTheme } from "./composeTheme";
import { SchedulePicker } from "./SchedulePicker";

export function ComposerPublishPanel() {
  const { colors, fonts } = useComposeTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submitLockRef = useRef(false);
  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);

  const {
    content,
    accounts,
    selectedAccounts,
    images,
    submitting,
    scheduledForLocal,
    error: composerError,
  } = useAppSelector(selectComposer);
  const { user } = useAppSelector(selectAuth);
  const { items: accountsFromSlice, loading: accountsLoading, error: accountsError } =
    useAppSelector(selectAccounts);
  const platformAccounts = mergePlatformAccounts(accounts, accountsFromSlice);
  const [panelError, setPanelError] = useState<string | null>(null);

  const noAccountsMessage = user?.email
    ? `Is account (${user.email}) par koi platform connected nahi. Accounts page se LinkedIn connect karo — ya us email se login karo jahan LinkedIn pehle connect hua (haseebcodejourney@gmail.com).`
    : "Connect a platform on the Accounts page";

  const hasContent = draft.trim().length > 0 || content.trim().length > 0 || images.length > 0;
  const hasAccounts = platformAccounts.length > 0;
  const hasPlatform = selectedAccounts.length > 0;
  const canSubmit = hasContent && hasPlatform && hasAccounts && !submitting;

  const blockers: string[] = [];
  if (accountsLoading) blockers.push("Loading connected accounts…");
  else if (!hasAccounts) {
    if (accountsError) blockers.push(`Accounts load failed: ${accountsError}`);
    else if (composerError) blockers.push(composerError);
    else blockers.push(noAccountsMessage);
  }
  if (!hasContent) blockers.push("Add post text or at least one image");
  if (hasAccounts && !hasPlatform) blockers.push("Select at least one platform below");
  if (submitting) blockers.push("Post is submitting — please wait");

  async function handleSubmit(mode: "draft" | "publish" | "schedule") {
    setPanelError(null);
    const freshContent = flushComposerDraftToRedux((value) => dispatch(setContent(value)));

    let liveAccounts = platformAccounts;
    try {
      liveAccounts = await dispatch(fetchAccounts()).unwrap();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Accounts load failed";
      setPanelError(`${message} — backend chal raha hai? Logout karke dubara login karo.`);
      return;
    }

    const readyContent = freshContent.trim().length > 0 || images.length > 0;

    if (liveAccounts.length === 0) {
      setPanelError(noAccountsMessage);
      return;
    }

    let liveSelected = selectedAccounts.filter((id) =>
      liveAccounts.some((account) => account.id === id),
    );
    if (liveSelected.length === 0) {
      const defaultId = pickDefaultAccountId(liveAccounts);
      if (defaultId) {
        liveSelected = [defaultId];
        dispatch(setSelectedAccounts(liveSelected));
      }
    }

    if (!readyContent) {
      setPanelError("Add post text or at least one image");
      return;
    }

    if (liveSelected.length === 0) {
      setPanelError("Select at least one platform below");
      return;
    }

    const brokenSelected = liveSelected
      .map((id) => liveAccounts.find((a) => a.id === id))
      .filter((account): account is NonNullable<typeof account> => Boolean(account))
      .find((account) => isAccountConnectionBroken(account));

    if (brokenSelected) {
      setPanelError(
        describeConnectionIssue(brokenSelected) ??
          "Platform connection failed — Accounts page se reconnect karo.",
      );
      return;
    }

    if (submitLockRef.current || submitting) return;
    submitLockRef.current = true;

    try {
      const result = await dispatch(submitPost(mode));
      if (submitPost.fulfilled.match(result)) {
        dispatch(fetchPostCounts());
        if (mode === "publish") navigate("/posts/published");
        else if (mode === "schedule") navigate("/posts/scheduled");
        else navigate("/posts/drafts");
      } else if (submitPost.rejected.match(result)) {
        setPanelError((result.payload as string) ?? "Failed to create post");
      }
    } finally {
      submitLockRef.current = false;
    }
  }

  const note = canSubmit
    ? `Ready to post to ${selectedAccounts.length} platform${selectedAccounts.length > 1 ? "s" : ""}.`
    : blockers.join(" · ");
  const visibleError = panelError ?? composerError;
  const connectionPublishError =
    visibleError && isAuthConnectionError(visibleError) ? visibleError : null;

  const btnBase = {
    textTransform: "none" as const,
    fontWeight: 700,
    fontSize: 14.5,
    fontFamily: fonts.body,
    minHeight: 46,
    borderRadius: "10px",
    justifyContent: "center",
    letterSpacing: "0.01em",
    transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
  };

  const disabledBtn = {
    opacity: 1,
    bgcolor: `${colors.surface2} !important`,
    color: `${colors.textSecondary} !important`,
    border: `1.5px solid ${colors.border} !important`,
    boxShadow: "none !important",
    cursor: "not-allowed",
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <SchedulePicker
          value={scheduledForLocal}
          onChange={(value) => dispatch(setScheduledForLocal(value))}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          fullWidth
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit("publish")}
          sx={{
            ...btnBase,
            color: "#fff",
            border: "none",
            background: canSubmit
              ? `linear-gradient(155deg, #6B7BFF 0%, ${colors.accent} 45%, #3B4EE0 100%)`
              : `${colors.surface2}`,
            boxShadow: canSubmit ? "0 10px 22px -6px rgba(46,92,255,0.45)" : "none",
            "&:hover": canSubmit
              ? {
                  background: "linear-gradient(155deg, #7583ff 0%, #5568ff 45%, #4350e8 100%)",
                  boxShadow: "0 12px 26px -6px rgba(46,92,255,0.55)",
                  transform: "translateY(-1px)",
                }
              : { bgcolor: colors.surface2 },
            "&:active": canSubmit ? { transform: "translateY(0)" } : {},
            "&.Mui-disabled": disabledBtn,
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Publish now"}
        </Button>
        <Button
          fullWidth
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit("schedule")}
          sx={{
            ...btnBase,
            bgcolor: canSubmit ? colors.accent : colors.surface2,
            color: canSubmit ? "#fff" : colors.textSecondary,
            border: canSubmit ? "none" : `1.5px solid ${colors.border}`,
            boxShadow: canSubmit ? "0 6px 16px -4px rgba(46,92,255,0.35)" : "none",
            "&:hover": canSubmit
              ? { bgcolor: colors.accent, filter: "brightness(1.06)", transform: "translateY(-1px)" }
              : { bgcolor: colors.surface2 },
            "&.Mui-disabled": disabledBtn,
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Schedule post"}
        </Button>
        <Button
          fullWidth
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit("draft")}
          sx={{
            ...btnBase,
            bgcolor: colors.surface,
            color: colors.textPrimary,
            border: `1.5px solid ${colors.borderStrong}`,
            boxShadow: canSubmit ? "0 1px 2px rgba(16,24,40,0.04)" : "none",
            "&:hover": canSubmit
              ? { bgcolor: colors.surface2, borderColor: colors.accent, color: colors.accent }
              : {},
            "&.Mui-disabled": disabledBtn,
          }}
        >
          Save as draft
        </Button>
      </Box>

      <ConnectionErrorAlert
        accounts={platformAccounts}
        selectedAccountIds={selectedAccounts}
        publishError={connectionPublishError}
        onDismiss={() => setPanelError(null)}
      />

      {visibleError && !connectionPublishError && (
        <Typography
          sx={{
            fontSize: 12.5,
            color: colors.danger,
            textAlign: "center",
            mt: 1.25,
            fontFamily: fonts.body,
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          {visibleError}
        </Typography>
      )}

      <Typography
        sx={{
          fontSize: 12,
          color: canSubmit ? colors.success : colors.textSecondary,
          textAlign: "center",
          mt: visibleError ? 0.75 : 1.5,
          fontFamily: fonts.body,
          fontWeight: canSubmit ? 600 : 500,
        }}
      >
        {note}
      </Typography>
    </>
  );
}
