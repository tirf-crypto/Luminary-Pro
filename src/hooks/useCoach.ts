import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { CoachConversation, CoachMessage } from '@/types';

interface StreamingMessage {
  id: string;
  content: string;
  isStreaming: boolean;
}

export const useCoach = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<CoachConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<CoachConversation | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      setConversations(data as CoachConversation[] || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data as CoachMessage[] || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createConversation = useCallback(async (title?: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          title: title || 'New Conversation',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const conversation = data as CoachConversation;
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      setMessages([]);
      
      return conversation;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !currentConversation) return;
    
    // Cancel any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save user message
      const { data: userMessage, error: messageError } = await supabase
        .from('coach_messages')
        .insert({
          conversation_id: currentConversation.id,
          role: 'user',
          content,
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      setMessages(prev => [...prev, userMessage as CoachMessage]);
      
      // Update conversation last message time
      await supabase
        .from('coach_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentConversation.id);
      
      // Start streaming response
      abortControllerRef.current = new AbortController();
      
      const streamingId = `streaming-${Date.now()}`;
      setStreamingMessage({
        id: streamingId,
        content: '',
        isStreaming: true,
      });
      
      // Call AI Coach edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            message: content,
            conversationId: currentConversation.id,
          }),
          signal: abortControllerRef.current.signal,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setStreamingMessage(null);
                
                // Save assistant message
                const { data: assistantMessage } = await supabase
                  .from('coach_messages')
                  .insert({
                    conversation_id: currentConversation.id,
                    role: 'assistant',
                    content: fullContent,
                  })
                  .select()
                  .single();
                
                if (assistantMessage) {
                  setMessages(prev => [...prev, assistantMessage as CoachMessage]);
                }
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    fullContent += parsed.content;
                    setStreamingMessage(prev => 
                      prev ? { ...prev, content: fullContent } : null
                    );
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const message = handleSupabaseError(err);
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
      abortControllerRef.current = null;
    }
  }, [user?.id, currentConversation]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('coach_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      toast.success('Conversation deleted');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id, currentConversation]);

  const selectConversation = useCallback(async (conversation: CoachConversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    streamingMessage,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation,
  };
};
