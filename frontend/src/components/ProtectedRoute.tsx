import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectAuth } from "../store/slices/authSlice";

export function ProtectedRoute() {
  const { token, loading } = useAppSelector(selectAuth);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
