import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { message, history = [] }: { message: string; history: ChatMessage[] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for vector search
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Convert user query to embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-large',
        input: message,
        dimensions: 3072,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error('OpenAI embedding error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate embedding' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Perform vector similarity search using direct SQL
    // Supabase RPC should handle vector type conversion automatically
    // Pass the embedding array directly
    const { data: matches, error: searchError } = await supabase.rpc('match_ray_chat', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
    });

    let context = '';
    
    if (searchError) {
      console.error('Vector search error:', searchError);
      // Fallback: Get all documents if vector search fails
      const { data: allDocs, error: directError } = await supabase
        .from('ray_chat')
        .select('chunks')
        .limit(5);

      if (!directError && allDocs) {
        context = allDocs
          .flatMap((row: any) => Array.isArray(row.chunks) ? row.chunks : [])
          .join('\n\n')
          .substring(0, 3000);
      }
    } else if (matches && matches.length > 0) {
      // Extract context from matches
      context = matches
        .map((match: any) => {
          if (Array.isArray(match.chunks)) {
            return match.chunks.join('\n\n');
          }
          return match.chunks || '';
        })
        .join('\n\n')
        .substring(0, 3000);
    }

    // Step 3: Generate response with OpenAI using context
    const response = await generateResponse(message, history, context);

    return new Response(
      JSON.stringify({ response }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

async function generateResponse(
  message: string,
  history: ChatMessage[],
  context: string
): Promise<string> {
  const systemPrompt = `You are a helpful assistant for Ray-Ban Meta smart glasses. 
You have access to detailed information about Ray-Ban Meta glasses including features, specifications, history, and capabilities.
Use the provided context to answer questions accurately and helpfully. If the context doesn't contain relevant information, 
you can provide general helpful responses about Ray-Ban Meta glasses based on your knowledge.

Be conversational, friendly, and concise. Focus on helping users understand the product and its features.

IMPORTANT FORMATTING GUIDELINES:
- Use **bold** for important terms and feature names
- Use ✅ for checkmarks when providing step-by-step instructions
- Use numbered lists (1. 2. 3.) for sequential steps
- Use bullet points (- or •) for lists of items
- Use clear line breaks between sections
- Format step-by-step guides with "✅ Step X:" headers
- Keep responses well-structured and easy to read`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-5), // Last 5 messages for context
    {
      role: 'user',
      content: context
        ? `Context from knowledge base:\n${context}\n\nUser question: ${message}`
        : message,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}
