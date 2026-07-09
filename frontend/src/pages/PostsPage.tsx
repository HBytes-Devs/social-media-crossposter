import { useEffect } from "react";
import { PostImage } from "../components/PostImage";
import { Card } from "../components/ui/Card";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";
import { fetchPosts, selectPosts } from "../store/slices/postsSlice";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-700 text-slate-200",
  PUBLISHED: "bg-green-900/50 text-green-300",
  PUBLISHING: "bg-yellow-900/50 text-yellow-300",
  FAILED: "bg-red-900/50 text-red-300",
  PARTIAL: "bg-orange-900/50 text-orange-300",
};

export function PostsPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const { items: posts, loading } = useAppSelector(selectPosts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Posts</h1>
        <p className="mt-1 text-sm text-slate-400">Aapki saari posts yahan</p>
      </header>

      {posts.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">Abhi koi post nahi. Compose se nayi post banao.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[post.status] ?? "bg-slate-700"}`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {post.hashtagMode} · {post.language}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-200">
                    {post.finalContent || post.content || "(image only)"}
                  </p>
                  {post.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.images.slice(0, 4).map((url) => (
                        <PostImage
                          key={url}
                          src={url}
                          token={token}
                          className="h-20 w-20 rounded-lg border border-slate-700 object-cover"
                        />
                      ))}
                      {post.images.length > 4 && (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-400">
                          +{post.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleString()} ·{" "}
                    {post.targets.map((t) => t.platform).join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
