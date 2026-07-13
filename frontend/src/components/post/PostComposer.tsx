import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import { ComposerFormSkeleton, LinkedInPreviewSkeleton } from "../ui/Skeleton";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearComposerMessages,
  fetchComposerData,
  selectComposer,
} from "../../store/slices/composerSlice";
import { selectToken } from "../../store/slices/authSlice";
import { selectAccounts, fetchAccounts } from "../../store/slices/accountsSlice";
import { ComposerFormPanel } from "./ComposerFormPanel";
import { ComposerLivePreview } from "./ComposerLivePreview";
import { ComposerPageHeader } from "./ComposerPageHeader";
import { useComposeTheme } from "./composeTheme";

export function PostComposer() {
  const { colors } = useComposeTheme();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const { error, success, initialized, accounts } = useAppSelector(selectComposer);
  const { items: accountsFromSlice, loading: accountsLoading } = useAppSelector(selectAccounts);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchComposerData());
    dispatch(fetchAccounts());
  }, [dispatch, token]);

  useEffect(() => {
    if (!token || !initialized) return;
    const total = accounts.length > 0 ? accounts.length : accountsFromSlice.length;
    if (total === 0 && !accountsLoading) {
      dispatch(fetchAccounts());
      dispatch(fetchComposerData());
    }
  }, [
    dispatch,
    token,
    initialized,
    accounts.length,
    accountsFromSlice.length,
    accountsLoading,
  ]);

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => dispatch(clearComposerMessages()), 6000);
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);

  const shellSx = {
    width: "100%",
    mx: { xs: -2, sm: -3, lg: -4 },
    mt: { xs: -2, sm: -3, lg: -4 },
    mb: { xs: -2, sm: -3, lg: -4 },
    px: { xs: 2, sm: 3, lg: 4 },
    py: { xs: 2.5, sm: 3.5 },
    bgcolor: colors.bg,
    minHeight: "100%",
  };

  if (!initialized) {
    return (
      <Box sx={shellSx}>
        <ComposerPageHeader />
        <Box
          sx={{
            display: "grid",
            gap: "22px",
            gridTemplateColumns: { xs: "1fr", md: "1fr minmax(320px, 400px)" },
            alignItems: "start",
          }}
        >
          <ComposerFormSkeleton />
          <LinkedInPreviewSkeleton />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={shellSx}>
      <ComposerPageHeader />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearComposerMessages())}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearComposerMessages())}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: "22px",
          gridTemplateColumns: { xs: "1fr", md: "1fr minmax(320px, 400px)" },
          alignItems: "start",
        }}
      >
        <ComposerFormPanel />
        <ComposerLivePreview />
      </Box>
    </Box>
  );
}
