import React, { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal, User } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge } from '@/components/ui';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'finance', label: 'Finance' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'mindset', label: 'Mindset' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'general', label: 'General' },
];

export const Community: React.FC = () => {
  const { user } = useAuthStore();
  const {
    posts,
    isLoading,
    hasMore,
    fetchPosts,
    createPost,
    toggleReaction,
  } = useCommunity();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  useEffect(() => {
    fetchPosts({ category: selectedCategory as any });
  }, [selectedCategory]);

  const handleCreatePost = async () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      await createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
      });
      setIsCreateModalOpen(false);
      setNewPost({ title: '', content: '', category: 'general' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Community</h1>
          <p className="text-zinc-400 mt-1">Connect with fellow warriors</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} hover className="cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">
                    {post.author?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-sm text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="outline" size="sm" className="mt-1">
                  {post.category}
                </Badge>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{post.title}</h3>
            <p className="text-zinc-400 line-clamp-3 mb-4">{post.content}</p>

            <div className="flex items-center gap-4 pt-3 border-t border-zinc-800">
              <button
                onClick={() => toggleReaction(post.id, 'like')}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm">{post.reaction_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-sky-400 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.comment_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No posts yet in this category</p>
            <p className="text-sm text-zinc-600 mt-1">Be the first to share!</p>
          </Card>
        )}

        {hasMore && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => fetchPosts({ category: selectedCategory as any, offset: posts.length })}
            isLoading={isLoading}
          >
            Load More
          </Button>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-4">Create Post</h2>

            <div className="space-y-4">
              <Input
                label="Title"
                value={newPost.title}
                onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="What's on your mind?"
              />

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, insights, or questions..."
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreatePost}>
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
