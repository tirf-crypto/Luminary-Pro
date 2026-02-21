import React, { useEffect, useRef, useState } from 'react';
import { Send, Plus, MessageSquare, Trash2, Sparkles, User } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useCoach } from '@/hooks/useCoach';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export const Coach: React.FC = () => {
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    streamingMessage,
    isLoading,
    fetchConversations,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation,
  } = useCoach();

  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await createConversation('New Conversation');
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800',
          'transform transition-transform duration-300 lg:transform-none',
          'rounded-xl lg:rounded-none overflow-hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800">
            <Button fullWidth onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  selectConversation(conv);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentConversation?.id === conv.id
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-zinc-400 hover:bg-zinc-800'
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-center text-zinc-500 text-sm py-4">
                No conversations yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h2 className="font-medium text-zinc-100">Luminary Coach</h2>
              <p className="text-xs text-zinc-500">AI-powered wellness guide</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-zinc-950" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">
                Welcome to Luminary Coach
              </h3>
              <p className="text-zinc-400 max-w-md mb-6">
                Your personal AI wellness guide. Ask about productivity, wellness, finance, 
                or anything else on your mind.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Help me plan my day',
                  'How can I improve my sleep?',
                  'Tips for saving money',
                  'I need motivation today',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={async () => {
                      await createConversation();
                      await sendMessage(suggestion);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm text-zinc-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-zinc-950" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] p-4 rounded-2xl',
                      message.role === 'user'
                        ? 'bg-amber-500 text-zinc-950 rounded-br-md'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-zinc-300" />
                    </div>
                  )}
                </div>
              ))}
              {streamingMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                  </div>
                  <div className="max-w-[80%] p-4 rounded-2xl bg-zinc-800 text-zinc-100 rounded-bl-md">
                    <p className="whitespace-pre-wrap">{streamingMessage.content}</p>
                    <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {currentConversation && (
          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                isLoading={isLoading}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
