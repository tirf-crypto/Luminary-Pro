// ═══════════════════════════════════════════════════════════════════════════════
// LUMINARY AI COACH — PRODUCTION EDGE FUNCTION
// Intelligent, personalized wellness coaching with memory and context
// ═══════════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// OpenAI Configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = 'gpt-4-turbo-preview';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// System prompt for the AI Coach
const getSystemPrompt = (context: UserContext): string => {
  return `You are Luminary Coach — an elite, evidence-based wellness companion with deep expertise in:

AREAS OF EXPERTISE:
• Exercise science, sports nutrition, and periodization
• Sleep medicine and circadian biology
• Stress physiology and nervous system regulation
• Hormonal health (including perimenopause, menopause, and andropause)
• Burnout recovery and workplace wellness
• Entrepreneur psychology and high-performance mindset
• Financial wellness and money psychology
• Behavioral change science and habit formation
• Nutritional biochemistry and supplementation
• Mindfulness and contemplative practices

YOUR APPROACH:
• Warm, direct, and deeply personal — you know this user's context intimately
• Evidence-based but conversational — cite research when valuable, never lecture
• Action-oriented — every response includes ONE specific next step
• Context-aware — you remember their patterns, preferences, and progress
• Adaptive — you adjust tone and intensity based on their energy and needs

CURRENT USER CONTEXT:
Name: ${context.name}
Biological sex: ${context.biologicalSex}
Active personas: ${context.personas.join(', ')}
Goals: ${context.goals.join(', ') || 'Not specified'}
Their "why": ${context.why || 'Not specified'}

DAILY CONTEXT:
Wake time: ${context.wakeTime}
Work hours: ${context.workStart} - ${context.workEnd}
Training preference: ${context.trainingPreference}

TODAY'S STATE:
Energy: ${context.energy}/10
Mood/Clarity: ${context.clarity}/10
Body/Focus: ${context.body}/10
Day word: "${context.dayWord || 'Not specified'}"
Hybrid Day completion: ${context.dayCompletion}%
Current streak: ${context.streak} days

FINANCIAL CONTEXT:
Currency: ${context.currency}
Saved this month: ${context.currency}${context.savedMonth}
Invested in wellness: ${context.currency}${context.wellnessMonth}

COACHING MEMORY:
${context.memories.map(m => `• ${m.category}: ${m.key} = ${m.value}`).join('\n') || 'Building memory...'}

INSTRUCTIONS:
1. Address the user by name and acknowledge their current state
2. Provide specific, actionable advice based on their context
3. If energy is low (≤4): emphasize recovery, reduce intensity, validate rest
4. If energy is high (≥8): encourage pushing boundaries, add challenges
5. Reference their personas and goals in your advice
6. Always end with ONE specific action they can take RIGHT NOW
7. Keep responses concise (2-4 paragraphs) unless they ask for detail
8. Never be generic — every response should feel deeply personal

Remember: You are their trusted wellness partner. Be encouraging but honest. Celebrate progress. Normalize setbacks. Guide with wisdom.`;
};

interface UserContext {
  name: string;
  biologicalSex: string;
  personas: string[];
  goals: string[];
  why: string;
  wakeTime: string;
  workStart: string;
  workEnd: string;
  trainingPreference: string;
  energy: number;
  clarity: number;
  body: number;
  dayWord: string;
  dayCompletion: number;
  streak: number;
  currency: string;
  savedMonth: number;
  wellnessMonth: number;
  memories: Array<{ category: string; key: string; value: string }>;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Fetch user context from database
async function fetchUserContext(supabase: any, userId: string): Promise<UserContext> {
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Fetch today's checkin
  const today = new Date().toISOString().split('T')[0];
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  // Fetch today's day plan
  const { data: dayPlan } = await supabase
    .from('hybrid_day_plans')
    .select('completion_percentage')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  // Fetch streak
  const { data: streakData } = await supabase
    .from('habit_completions')
    .select('date')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('date', { ascending: false });

  // Calculate streak
  let streak = 0;
  if (streakData && streakData.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const uniqueDates = [...new Set(streakData.map((d: any) => d.date))].sort().reverse();
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      let checkDate = uniqueDates[0] === today ? today : yesterday;
      for (const date of uniqueDates) {
        if (date === checkDate) {
          streak++;
          const prev = new Date(checkDate);
          prev.setDate(prev.getDate() - 1);
          checkDate = prev.toISOString().split('T')[0];
        } else {
          break;
        }
      }
    }
  }

  // Fetch financial stats
  const startOfMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
  
  const { data: savingsData } = await supabase
    .from('savings_entries')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', startOfMonth);

  const { data: spendingData } = await supabase
    .from('spending_entries')
    .select('amount')
    .eq('user_id', userId)
    .eq('is_wellness', true)
    .gte('date', startOfMonth);

  // Fetch coach memories
  const { data: memories } = await supabase
    .from('coach_memories')
    .select('category, key, value')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    name: profile?.name || 'there',
    biologicalSex: profile?.biological_sex || 'unspecified',
    personas: profile?.active_personas || ['optimizer'],
    goals: profile?.goals || [],
    why: profile?.why_statement || '',
    wakeTime: profile?.wake_time || '06:30',
    workStart: profile?.work_start || '08:00',
    workEnd: profile?.work_end || '18:00',
    trainingPreference: profile?.training_preference || 'morning',
    energy: checkin?.energy_score || 5,
    clarity: checkin?.mood_score || 5,
    body: checkin?.focus_score || 5,
    dayWord: checkin?.day_word || '',
    dayCompletion: dayPlan?.completion_percentage || 0,
    streak,
    currency: profile?.currency || 'USD',
    savedMonth: savingsData?.reduce((sum: number, s: any) => sum + s.amount, 0) || 0,
    wellnessMonth: spendingData?.reduce((sum: number, s: any) => sum + s.amount, 0) || 0,
    memories: memories || [],
  };
}

// Extract memories from AI response
function extractMemories(response: string, userId: string): Array<{ category: string; key: string; value: string }> {
  const memories: Array<{ category: string; key: string; value: string }> = [];
  
  // Look for preference statements
  const preferencePatterns = [
    /prefers?\s+(.+?)(?:\.|,|;|$)/i,
    /likes?\s+(.+?)(?:\.|,|;|$)/i,
    /enjoys?\s+(.+?)(?:\.|,|;|$)/i,
    /doesn'?t\s+like\s+(.+?)(?:\.|,|;|$)/i,
  ];
  
  for (const pattern of preferencePatterns) {
    const match = response.match(pattern);
    if (match) {
      memories.push({
        category: 'preference',
        key: match[0].split(' ')[0].toLowerCase(),
        value: match[1].trim(),
      });
    }
  }
  
  return memories;
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { messages, conversationId } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user context
    const userContext = await fetchUserContext(supabase, user.id);

    // Build messages for OpenAI
    const openaiMessages: Message[] = [
      { role: 'system', content: getSystemPrompt(userContext) },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    // Call OpenAI API with streaming
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI error:', error);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Parse SSE data
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
          reader.releaseLock();

          // Save the complete response to database
          if (conversationId && fullResponse) {
            await supabase.from('coach_messages').insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: 'assistant',
              content: fullResponse,
              model: OPENAI_MODEL,
              context_snapshot: userContext,
            });

            // Extract and save memories
            const memories = extractMemories(fullResponse, user.id);
            for (const memory of memories) {
              await supabase.from('coach_memories').upsert({
                user_id: user.id,
                category: memory.category,
                key: memory.key,
                value: memory.value,
                source_message_id: null, // Would need to get the inserted message ID
              }, { onConflict: 'user_id,category,key' });
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
