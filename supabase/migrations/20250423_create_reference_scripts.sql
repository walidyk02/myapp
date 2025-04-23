-- Create reference_scripts table for storing existing scripts
CREATE TABLE IF NOT EXISTS reference_scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    script_content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable full text search for better script matching
ALTER TABLE reference_scripts ADD COLUMN IF NOT EXISTS 
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('french', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('french', coalesce(script_content, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS reference_scripts_search_idx ON reference_scripts USING GIN (search_vector);

-- Enable RLS
ALTER TABLE reference_scripts ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Allow read for authenticated users" 
    ON reference_scripts FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow insert for authenticated users" 
    ON reference_scripts FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
