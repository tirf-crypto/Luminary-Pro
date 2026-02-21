import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { CommunityPost, PostComment, PostReaction } from '@/types';

type PostCategory = 'all' | 'wellness' | 'finance' | 'productivity' | 'mindset' | 'herbs' | 'general';

export const useCommunity = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [currentPost, setCurrentPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (options?: {
    category?: PostCategory;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          comments:post_comments(count),
          reactions:post_reactions(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      
      query = query.range(offset, offset + limit - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const formattedPosts = (data || []).map(post => ({
        ...post,
        comment_count: post.comments?.[0]?.count || 0,
        reaction_count: post.reactions?.[0]?.count || 0,
      }));
      
      if (offset === 0) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }
      
      setHasMore((data || []).length === limit);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (postId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      
      setCurrentPost(data as CommunityPost);
      
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) throw commentsError;
      
      setComments(commentsData as PostComment[] || []);
    } catch (err) {
      toast.error(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (post: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
  }) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          ...post,
          is_published: true,
        })
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      setPosts(prev => [data as CommunityPost, ...prev]);
      toast.success('Post created successfully');
      return data as CommunityPost;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      setComments(prev => [...prev, data as PostComment]);
      
      // Update post comment count
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comment_count: (p.comment_count || 0) + 1 }
            : p
        )
      );
      
      toast.success('Comment added');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  const toggleReaction = useCallback(async (postId: string, type: 'like' | 'love' | 'insightful' | 'supportive') => {
    if (!user?.id) return;
    
    try {
      // Check if user already reacted
      const { data: existingReaction, error: checkError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingReaction) {
        // Remove reaction
        const { error: deleteError } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (deleteError) throw deleteError;
        
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? { ...p, reaction_count: Math.max(0, (p.reaction_count || 0) - 1) }
              : p
          )
        );
      } else {
        // Add reaction
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type,
          });
        
        if (insertError) throw insertError;
        
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? { ...p, reaction_count: (p.reaction_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  const deletePost = useCallback(async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('community-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
        },
        (payload) => {
          setPosts(prev => [payload.new as CommunityPost, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
        },
        (payload) => {
          if (currentPost?.id === payload.new.post_id) {
            setComments(prev => [...prev, payload.new as PostComment]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentPost?.id]);

  return {
    posts,
    currentPost,
    comments,
    isLoading,
    error,
    hasMore,
    fetchPosts,
    fetchPost,
    createPost,
    addComment,
    toggleReaction,
    deletePost,
  };
};
