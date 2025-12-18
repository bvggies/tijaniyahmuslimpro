import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';

interface ModerationPost {
  id: string;
  content: string;
  createdAt: string;
  isHidden: boolean;
  author: { id: string; email: string; name: string | null };
  comments: number;
  likes: number;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function CommunityModerationPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['adminCommunityPosts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-community-posts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load posts');
      return (await res.json()) as { posts: ModerationPost[] };
    },
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-community-posts`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, isHidden }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminCommunityPosts'] });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Community moderation</h1>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">Recent posts</div>
        {data?.posts?.length ? (
          data.posts.map(post => (
            <div
              key={post.id}
              className="rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-emerald-100/80">
                  {post.author.name || post.author.email} ·{' '}
                  {new Date(post.createdAt).toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-100/70">
                  {post.likes} likes · {post.comments} comments
                </span>
              </div>
              <div className="text-xs text-emerald-50 mb-1">{post.content}</div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-100/70">
                  Status: {post.isHidden ? 'Hidden' : 'Visible'}
                </span>
                <Button
                  variant="secondary"
                  className="text-[11px] px-3 py-1"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: post.id, isHidden: !post.isHidden })}
                >
                  {post.isHidden ? 'Unhide' : 'Hide'}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No posts yet.</div>
        )}
      </Card>
    </div>
  );
}

