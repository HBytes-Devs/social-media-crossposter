import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "../store/hooks";
import { initializeAuth } from "../store/slices/authSlice";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return children;
}
