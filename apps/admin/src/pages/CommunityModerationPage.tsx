import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquare, Eye, EyeOff, Trash2, User } from 'lucide-react';
import { Card, Button, Badge, Table, TableRow, TableCell } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  isHidden: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

export function CommunityModerationPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'hidden' | 'visible'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-community-posts', filter],
    queryFn: async () => {
      return apiRequest<{ posts: Post[] }>('/api/admin-community-posts', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      return apiRequest(`/api/admin-community-posts?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isHidden: !isHidden }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin-community-posts?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
    },
  });

  const filteredPosts = data?.posts?.filter((post) => {
    if (filter === 'hidden') return post.isHidden;
    if (filter === 'visible') return !post.isHidden;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Community Moderation</h1>
          <p className="text-sm text-gray-600 mt-1">Moderate community posts and comments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'visible' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('visible')}
          >
            Visible
          </Button>
          <Button
            variant={filter === 'hidden' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('hidden')}
          >
            Hidden
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading posts...</div>
        </Card>
      ) : (
        <Card padding="none">
          <Table headers={['Author', 'Content', 'Engagement', 'Status', 'Actions']}>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#18F59B] to-[#0A3D35] flex items-center justify-center text-white font-semibold">
                      {post.author.name?.[0]?.toUpperCase() || post.author.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{post.author.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{post.author.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                    {post.imageUrl && (
                      <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden">
                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>❤️ {post._count.likes} likes</div>
                    <div>💬 {post._count.comments} comments</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={post.isHidden ? 'warning' : 'success'}>
                    {post.isHidden ? 'Hidden' : 'Visible'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibilityMutation.mutate({ id: post.id, isHidden: post.isHidden })}
                    >
                      {post.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
