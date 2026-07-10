import { memo, useMemo, useRef, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  flushComposerDraftToRedux,
  getComposerDraft,
  subscribeComposerDraft,
} from "../../lib/composerDraft";
import { useLocalizedContent } from "../../hooks/useLocalizedContent";
import { previewPostContent } from "../../lib/hashtags";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuth, selectToken } from "../../store/slices/authSlice";
import {
  selectComposer,
  setContent,
  setScheduledForLocal,
  submitPost,
} from "../../store/slices/composerSlice";
import { fetchPostCounts } from "../../store/slices/postsSlice";
import { LinkedInPostPreview } from "./LinkedInPostPreview";
import { SchedulePicker } from "./SchedulePicker";

export const ComposerPreviewPanel = memo(function ComposerPreviewPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);
  const { user } = useAppSelector(selectAuth);
  const {
    hashtagMode,
    hashtags,
    language,
    images,
    accounts,
    selectedAccounts,
    mediaLibrary,
    imageWarnings,
    submitting,
    scheduledForLocal,
  } = useAppSelector(selectComposer);

  const submitLockRef = useRef(false);

  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);
  const localizedDraft = useLocalizedContent(draft, language, token);
  const previewBody = language === "en" ? draft : localizedDraft;

  const hasLinkedInSelected = selectedAccounts.some((id) => {
    const acc = accounts.find((a) => a.id === id);
    return acc?.platform === "LINKEDIN";
  });

  const linkedInAccount = accounts.find(
    (a) => a.platform === "LINKEDIN" && selectedAccounts.includes(a.id),
  );

  const authorName =
    linkedInAccount?.accountName ?? user?.name ?? user?.email ?? "Your Name";

  const preview = useMemo(
    () =>
      previewPostContent({
        content: previewBody,
        hashtagMode,
        hashtags,
        language,
      }),
    [previewBody, hashtagMode, hashtags, language],
  );

  const previewHashtags = useMemo(() => {
    if (hashtagMode === "none") return [];
    if (hashtagMode === "manual") return preview.hashtags;
    if (!previewBody.trim()) return [];
    return preview.hashtags;
  }, [previewBody, hashtagMode, preview.hashtags]);

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

  const actionsDisabled = accounts.length === 0 || submitting;

  return (
    <div className="space-y-6 lg:col-span-2">
      <Card
        title="LinkedIn Preview"
        description={
          hasLinkedInSelected
            ? "Publish se pehle aise dikhega"
            : "LinkedIn select karo preview ke liye"
        }
      >
        {hasLinkedInSelected ? (
          <LinkedInPostPreview
            authorName={authorName}
            authorAvatar={user?.avatarUrl}
            body={previewBody}
            hashtags={previewHashtags}
            hashtagMode={hashtagMode}
            images={images}
            token={token}
            mediaLibrary={mediaLibrary}
            imageWarnings={imageWarnings}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Platforms mein LinkedIn checkbox on karo — live feed-style preview yahan
            dikhega.
          </p>
        )}
      </Card>

      <Card title="Publish or schedule" description="Ek hi action panel — duplicate submit nahi hoga">
        <Stack spacing={2}>
          <SchedulePicker
            value={scheduledForLocal}
            onChange={(value) => dispatch(setScheduledForLocal(value))}
          />

          <Button
            variant="secondary"
            className="w-full"
            loading={submitting}
            disabled={actionsDisabled}
            onClick={() => handleSubmit("schedule")}
          >
            Schedule post
          </Button>

          <Button
            className="w-full"
            loading={submitting}
            disabled={actionsDisabled}
            onClick={() => handleSubmit("publish")}
          >
            Publish now
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            loading={submitting}
            disabled={actionsDisabled}
            onClick={() => handleSubmit("draft")}
          >
            Save as draft
          </Button>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Sirf ek post create hogi — schedule, publish, ya draft.
          </Typography>
        </Stack>
      </Card>
    </div>
  );
});
