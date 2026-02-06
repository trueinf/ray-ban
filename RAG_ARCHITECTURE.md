# RAG (Retrieval-Augmented Generation) Architecture

## Overview
This application uses RAG to provide accurate, context-aware responses about Ray-Ban Meta glasses by combining vector search with LLM generation.

## RAG Pipeline Flow

```
┌─────────────────┐
│  User Query     │
│  "Battery dies  │
│   too fast"     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (script.js)                                   │
│  - User types message                                   │
│  - Sends to Supabase Edge Function                      │
└────────┬────────────────────────────────────────────────┘
         │
         │ POST /functions/v1/chatbot
         │ { message: "...", history: [...] }
         ▼
┌─────────────────────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTION (chatbot/index.ts)              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ STEP 1: QUERY EMBEDDING                          │  │
│  │ - Convert user query to vector embedding         │  │
│  │ - Model: text-embedding-3-large (3072 dims)     │  │
│  │ - OpenAI API: /v1/embeddings                     │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                      │
│                  │ queryEmbedding: [0.123, -0.456, ...]│
│                  ▼                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ STEP 2: VECTOR SEARCH (RETRIEVAL)                │  │
│  │ - Search ray_chat table using pgvector           │  │
│  │ - Function: match_ray_chat()                      │  │
│  │ - Similarity: Cosine distance (<=> operator)      │  │
│  │ - Threshold: 0.7 (70% similarity)                │  │
│  │ - Top K: 5 most similar chunks                    │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                      │
│                  │ context: "✅ Step 1: Turn off..."    │
│                  ▼                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ STEP 3: CONTEXT AUGMENTATION                     │  │
│  │ - Combine retrieved chunks                       │  │
│  │ - Limit to 3000 characters                       │  │
│  │ - Format: "Context: ...\n\nUser question: ..."   │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                      │
│                  │ Augmented prompt                    │
│                  ▼                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ STEP 4: GENERATION                               │  │
│  │ - Model: gpt-4o-mini                             │  │
│  │ - OpenAI API: /v1/chat/completions                │  │
│  │ - Includes: System prompt + History + Context    │  │
│  │ - Max tokens: 1000                                │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                      │
└──────────────────┼──────────────────────────────────────┘
                   │
                   │ { response: "I'm sorry about..." }
                   ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (script.js)                                    │
│  - Receives formatted response                          │
│  - Renders with markdown formatting                      │
│  - Displays to user                                     │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### `ray_chat` Table
```sql
CREATE TABLE ray_chat (
  id BIGSERIAL PRIMARY KEY,
  sheet_name TEXT,
  chunks JSONB,              -- Array of text chunks
  embedding VECTOR(3072),     -- Vector embeddings (pgvector)
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Vector Search Function
```sql
CREATE FUNCTION match_ray_chat(
  query_embedding VECTOR,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  sheet_name TEXT,
  chunks JSONB,
  similarity FLOAT
)
```

## Code Flow Details

### 1. Frontend Request (`script.js:165-195`)
```javascript
// User sends message
const response = await fetch(`${SUPABASE_URL}/functions/v1/chatbot`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify({
    message: message,
    history: conversationHistory.slice(-5) // Last 5 messages
  })
});
```

### 2. Query Embedding (`index.ts:46-70`)
```typescript
// Convert user query to vector
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

const queryEmbedding = embeddingData.data[0].embedding;
// Returns: [0.123, -0.456, 0.789, ...] (3072 dimensions)
```

### 3. Vector Search (`index.ts:75-108`)
```typescript
// Search for similar content
const { data: matches } = await supabase.rpc('match_ray_chat', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,  // 70% similarity minimum
  match_count: 5,         // Top 5 results
});

// Extract context from matches
const context = matches
  .map(match => match.chunks.join('\n\n'))
  .join('\n\n')
  .substring(0, 3000);
```

### 4. SQL Vector Search (PostgreSQL)
```sql
-- Cosine similarity search
SELECT 
  id, sheet_name, chunks,
  1 - (embedding <=> query_embedding) as similarity
FROM ray_chat
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > 0.7
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

### 5. Response Generation (`index.ts:138-192`)
```typescript
const messages = [
  { role: 'system', content: systemPrompt },
  ...history.slice(-5),  // Conversation history
  {
    role: 'user',
    content: `Context from knowledge base:\n${context}\n\nUser question: ${message}`
  },
];

// Generate response with context
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000,
  }),
});
```

## Key Components

### 1. **Embedding Model**
- **Model**: `text-embedding-3-large`
- **Dimensions**: 3072
- **Purpose**: Convert text to numerical vectors for semantic search

### 2. **Vector Database**
- **Database**: Supabase PostgreSQL with pgvector extension
- **Table**: `ray_chat`
- **Index**: Vector similarity index (HNSW or IVFFlat)

### 3. **Similarity Metric**
- **Method**: Cosine similarity
- **Operator**: `<=>` (pgvector cosine distance)
- **Threshold**: 0.7 (70% similarity)

### 4. **LLM Model**
- **Model**: `gpt-4o-mini`
- **Purpose**: Generate natural language responses
- **Context**: System prompt + Retrieved chunks + Conversation history

## Example Flow

### User Query:
```
"My glasses keep running out of battery too fast"
```

### Step 1: Embedding
```
Query → [0.123, -0.456, 0.789, ...] (3072 dimensions)
```

### Step 2: Vector Search
```
Finds top 5 similar chunks:
1. "Battery Life & Charging Frustration" script (similarity: 0.92)
2. "Battery optimization tips" (similarity: 0.85)
3. "Power management settings" (similarity: 0.78)
...
```

### Step 3: Context Augmentation
```
Context: "✅ Step 1: Turn off Always-On Meta AI...
         ✅ Step 2: Reduce Video Power Drain...
         ..."
         
User question: "My glasses keep running out of battery too fast"
```

### Step 4: Generation
```
LLM generates response using:
- System prompt (role definition)
- Retrieved context (battery troubleshooting steps)
- User question
- Conversation history

Response: "I'm sorry about that—that can be frustrating...
          ✅ Step 1: Turn off Always-On Meta AI..."
```

## Benefits of This RAG Approach

1. **Accuracy**: Responses grounded in actual knowledge base content
2. **Relevance**: Vector search finds semantically similar content
3. **Up-to-date**: Can update knowledge base without retraining LLM
4. **Transparency**: Can trace responses back to source chunks
5. **Cost-effective**: Smaller LLM (gpt-4o-mini) with focused context

## Performance Considerations

- **Embedding**: ~200-500ms (OpenAI API)
- **Vector Search**: ~50-200ms (PostgreSQL pgvector)
- **Generation**: ~1-3s (OpenAI API)
- **Total**: ~2-4 seconds per query

## Current Configuration

- **Match Threshold**: 0.7 (70% similarity)
- **Top K Results**: 5 chunks
- **Context Limit**: 3000 characters
- **History Window**: Last 5 messages
- **Max Tokens**: 1000 tokens per response
