import { useEffect } from "react";
import { ComposerFormSkeleton, LinkedInPreviewSkeleton } from "../ui/Skeleton";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
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

  if (!initialized) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white">New Post</h1>
          <p className="mt-1 text-sm text-slate-400">Loading composer…</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ComposerFormSkeleton />
          </div>
          <div className="lg:col-span-2">
            <LinkedInPreviewSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">New Post</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hashtags, language aur images — sab control yahan se
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-950/50 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <ComposerFormPanel />
        <ComposerPreviewPanel />
      </div>
    </div>
  );
}
