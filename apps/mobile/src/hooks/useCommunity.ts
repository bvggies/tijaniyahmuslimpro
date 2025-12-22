import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ApiPost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
}

export const usePosts = () => {
  return useQuery<Post[], Error>({
    queryKey: ['community', 'posts'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ posts: ApiPost[] }>('/api/community-feed');
        
        // Handle case where response might be empty or malformed
        if (!response || !response.posts) {
          console.warn('API returned empty or invalid response, returning empty array');
          return [];
        }
        
        // Transform API response to match Post interface
        const transformedPosts: Post[] = response.posts.map((p) => ({
          id: p.id,
          content: p.content,
          author: {
            id: p.author?.id || 'unknown',
            name: p.author?.name || 'Anonymous',
          },
          likes: p.likeCount || 0,
          comments: p.commentCount || 0,
          isLiked: p.likedByViewer || false,
          createdAt: p.createdAt,
        }));
        
        return transformedPosts;
      } catch (error: any) {
        // Network errors are handled by apiClient with mock fallback
        // Only log non-network errors or if mocks are also unavailable
        if (error?.message === 'Network request failed. Please check your connection.') {
          // Return empty array for network errors (apiClient already tried mocks)
          return [];
        }
        
        // Log other errors only in dev mode
        if (__DEV__ && error?.message !== 'Network request failed. Please check your connection.') {
          console.warn('Failed to fetch posts:', error?.message || error);
        }
        
        // Return empty array instead of throwing to prevent UI crashes
        // The UI will show an empty state which is better UX
        return [];
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors or network errors (they'll use mocks)
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('403') ||
        error?.message?.includes('Network request failed')
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 0, // Always refetch to get latest posts
    // Return empty array on error instead of throwing
    throwOnError: false,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      try {
        const response = await apiClient.post<{ post: Post }>('/api/community-post', { content });
        
        // Handle case where response might be empty or malformed
        if (!response || !response.post) {
          throw new Error('Invalid response from server');
        }
        
        return response;
      } catch (error: any) {
        // Provide more specific error message
        const errorMessage = error?.response?.data?.error || 
                           error?.response?.data?.message || 
                           error?.message || 
                           'Failed to create post';
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (data) => {
      // Optimistically add the new post to the cache immediately
      if (data?.post) {
        const newPostId = data.post.id;
        queryClient.setQueryData<Post[]>(['community', 'posts'], (old = []) => {
          // Check if post already exists to avoid duplicates
          const exists = old.some((p) => p.id === newPostId);
          if (exists) return old;
          return [data.post, ...old];
        });
        
        // Don't refetch immediately - let the optimistic update persist
        // The next natural refetch (on mount, pull-to-refresh, or after 30s) will sync with server
        // This prevents the post from disappearing due to timing issues
      }
    },
    onError: (error: any) => {
      // Log error in dev mode for debugging
      if (__DEV__) {
        console.warn('Failed to create post:', error?.message || error);
      }
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      return apiClient.post<{ post: Post }>('/api/community-like', { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['community', 'posts', postId, 'comments'],
    queryFn: async () => {
      return apiClient.get<{ comments: Comment[] }>(`/api/community-comments?postId=${postId}`);
    },
    select: (data) => data.comments || [],
    enabled: !!postId,
  });
};

