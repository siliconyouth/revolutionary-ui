-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ResourceEmbedding table for storing component embeddings
CREATE TABLE IF NOT EXISTS "ResourceEmbedding" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "resourceId" TEXT NOT NULL UNIQUE,
    embedding vector(1536), -- OpenAI ada-002 embeddings
    model TEXT DEFAULT 'text-embedding-ada-002',
    version INTEGER DEFAULT 1,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_resource
        FOREIGN KEY ("resourceId") 
        REFERENCES "resources"(id) 
        ON DELETE CASCADE
);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS "ResourceEmbedding_embedding_idx" 
ON "ResourceEmbedding" 
USING hnsw (embedding vector_cosine_ops);

-- ComponentSubmissionEmbedding table
CREATE TABLE IF NOT EXISTS "ComponentSubmissionEmbedding" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "submissionId" TEXT NOT NULL UNIQUE,
    embedding vector(1536),
    model TEXT DEFAULT 'text-embedding-ada-002',
    version INTEGER DEFAULT 1,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_submission
        FOREIGN KEY ("submissionId") 
        REFERENCES "component_submissions"(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ComponentSubmissionEmbedding_embedding_idx" 
ON "ComponentSubmissionEmbedding" 
USING hnsw (embedding vector_cosine_ops);

-- SearchQuery table for analytics
CREATE TABLE IF NOT EXISTS "SearchQuery" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    query TEXT NOT NULL,
    embedding vector(1536),
    "resultCount" INTEGER NOT NULL,
    "clickedResults" JSONB,
    "searchDuration" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY ("userId") 
        REFERENCES "users"(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "SearchQuery_userId_idx" ON "SearchQuery"("userId");
CREATE INDEX IF NOT EXISTS "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt");

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_resource_embedding
    BEFORE UPDATE ON "ResourceEmbedding"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_component_submission_embedding
    BEFORE UPDATE ON "ComponentSubmissionEmbedding"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Function to search similar resources
CREATE OR REPLACE FUNCTION search_similar_resources(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    "resourceId" TEXT,
    score float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        re.id,
        re."resourceId",
        1 - (re.embedding <=> query_embedding) as score
    FROM "ResourceEmbedding" re
    WHERE 1 - (re.embedding <=> query_embedding) > match_threshold
    ORDER BY score DESC
    LIMIT match_count;
END;
$$;

-- Function to find similar components
CREATE OR REPLACE FUNCTION find_similar_components(
    resource_id TEXT,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id TEXT,
    "resourceId" TEXT,
    score float
)
LANGUAGE plpgsql
AS $$
DECLARE
    target_embedding vector(1536);
BEGIN
    -- Get the embedding for the target resource
    SELECT embedding INTO target_embedding
    FROM "ResourceEmbedding"
    WHERE "resourceId" = resource_id;
    
    IF target_embedding IS NULL THEN
        RETURN;
    END IF;
    
    -- Find similar resources
    RETURN QUERY
    SELECT 
        re.id,
        re."resourceId",
        1 - (re.embedding <=> target_embedding) as score
    FROM "ResourceEmbedding" re
    WHERE re."resourceId" != resource_id
    ORDER BY score DESC
    LIMIT match_count;
END;
$$;

-- Add RLS policies
ALTER TABLE "ResourceEmbedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComponentSubmissionEmbedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SearchQuery" ENABLE ROW LEVEL SECURITY;

-- Anyone can read embeddings
CREATE POLICY "ResourceEmbedding_read_policy" ON "ResourceEmbedding"
    FOR SELECT USING (true);

CREATE POLICY "ComponentSubmissionEmbedding_read_policy" ON "ComponentSubmissionEmbedding"
    FOR SELECT USING (true);

-- Only authenticated users can create search queries
CREATE POLICY "SearchQuery_insert_policy" ON "SearchQuery"
    FOR INSERT WITH CHECK (true);

-- Users can only read their own search queries
CREATE POLICY "SearchQuery_read_policy" ON "SearchQuery"
    FOR SELECT USING (
        auth.uid()::text = "userId" OR "userId" IS NULL
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON "ResourceEmbedding" TO anon, authenticated;
GRANT SELECT ON "ComponentSubmissionEmbedding" TO anon, authenticated;
GRANT SELECT, INSERT ON "SearchQuery" TO authenticated;
GRANT EXECUTE ON FUNCTION search_similar_resources TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_similar_components TO anon, authenticated;