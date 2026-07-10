type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/80 ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function LinkedInPreviewSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="flex justify-between border-t border-slate-800 px-4 py-3">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function ComposerFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <Skeleton className="h-5 w-28" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonText lines={4} />
      <div className="flex gap-2">
        <Skeleton className="h-20 w-20" />
        <Skeleton className="h-20 w-20" />
      </div>
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
