import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { ComposerFormSkeleton, LinkedInPreviewSkeleton } from "../ui/Skeleton";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearComposerMessages,
  fetchComposerData,
  selectComposer,
} from "../../store/slices/composerSlice";
import { ComposerFormPanel } from "./ComposerFormPanel";
import { ComposerPreviewPanel } from "./ComposerPreviewPanel";

export function PostComposer() {
  const dispatch = useAppDispatch();
  const { error, success, initialized } = useAppSelector(selectComposer);

  useEffect(() => {
    dispatch(fetchComposerData());
  }, [dispatch]);

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => dispatch(clearComposerMessages()), 6000);
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);

  if (!initialized) {
    return (
      <Box sx={{ mx: "auto", maxWidth: 1152 }}>
        <Typography variant="h4" fontWeight={800}>
          New Post
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Loading composer…
        </Typography>
        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
          }}
        >
          <ComposerFormSkeleton />
          <LinkedInPreviewSkeleton />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mx: "auto", maxWidth: 1152 }}>
      <Typography variant="h4" fontWeight={800}>
        New Post
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Hashtags, language aur images — sab control yahan se
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => dispatch(clearComposerMessages())}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => dispatch(clearComposerMessages())}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
        }}
      >
        <ComposerFormPanel />
        <ComposerPreviewPanel />
      </Box>
    </Box>
  );
}
