import React, { useState, useEffect } from 'react';
import { RefreshCw, Heart, Share2, Quote, Sparkles } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Quote {
  id: string;
  content: string;
  author: string;
  category: string;
}

export const Motivation: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<string[]>([]);

  const fetchRandomQuote = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true)
        .order('random()')
        .limit(1)
        .single();

      if (error) throw error;
      setQuote(data);
    } catch (err) {
      console.error('Error fetching quote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_quotes')
        .select('quote_id');

      if (error) throw error;
      setSavedQuotes(data.map((sq) => sq.quote_id));
    } catch (err) {
      console.error('Error fetching saved quotes:', err);
    }
  };

  const toggleSaveQuote = async () => {
    if (!quote) return;

    try {
      if (savedQuotes.includes(quote.id)) {
        await supabase
          .from('saved_quotes')
          .delete()
          .eq('quote_id', quote.id);
        setSavedQuotes((prev) => prev.filter((id) => id !== quote.id));
      } else {
        await supabase.from('saved_quotes').insert({ quote_id: quote.id });
        setSavedQuotes((prev) => [...prev, quote.id]);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const shareQuote = async () => {
    if (!quote) return;

    const text = `"${quote.content}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Luminary Quote',
          text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    fetchSavedQuotes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100">Daily Inspiration</h1>
        <p className="text-zinc-400 mt-1">Fuel your mind with wisdom</p>
      </div>

      {/* Quote Card */}
      <Card className="relative overflow-hidden min-h-[400px] flex flex-col justify-center items-center p-8 text-center">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 left-10 text-[200px] font-serif text-amber-500">"</div>
          <div className="absolute bottom-10 right-10 text-[200px] font-serif text-amber-500 rotate-180">"</div>
        </div>

        {quote ? (
          <div className="relative z-10 max-w-2xl">
            <Quote className="w-12 h-12 text-amber-500/30 mx-auto mb-6" />
            
            <p className="text-2xl sm:text-3xl font-serif text-zinc-100 leading-relaxed mb-6">
              {quote.content}
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-8 h-px bg-zinc-700" />
              <p className="text-lg text-zinc-400">{quote.author}</p>
              <span className="w-8 h-px bg-zinc-700" />
            </div>

            <Badge variant="outline">{quote.category}</Badge>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleSaveQuote}
              >
                <Heart
                  className={cn(
                    'w-4 h-4 mr-2',
                    savedQuotes.includes(quote.id) && 'fill-rose-500 text-rose-500'
                  )}
                />
                {savedQuotes.includes(quote.id) ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={shareQuote}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={fetchRandomQuote}
                isLoading={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Sparkles className="w-12 h-12 text-amber-500/30 animate-pulse mb-4" />
            <p className="text-zinc-500">Loading inspiration...</p>
          </div>
        )}
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Wisdom', icon: '☯️' },
          { label: 'Success', icon: '🏆' },
          { label: 'Mindset', icon: '🧠' },
          { label: 'Growth', icon: '🌱' },
        ].map((cat) => (
          <Card
            key={cat.label}
            hover
            className="p-4 text-center cursor-pointer"
            onClick={() => {
              // Filter by category (would need implementation)
              fetchRandomQuote();
            }}
          >
            <span className="text-3xl mb-2 block">{cat.icon}</span>
            <p className="font-medium text-zinc-300">{cat.label}</p>
          </Card>
        ))}
      </div>

      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-1">
              This Week's Challenge
            </h3>
            <p className="text-zinc-400">
              Wake up 30 minutes earlier each day and use that time for yourself.
              Read, meditate, exercise, or simply enjoy the quiet.
            </p>
            <Button variant="secondary" size="sm" className="mt-4">
              I'm In
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
