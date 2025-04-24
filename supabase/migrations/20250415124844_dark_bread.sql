/*
  # Create scripts table and enable full-text search

  1. New Tables
    - `scripts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `code` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `scripts` table
    - Add policies for authenticated users to read and create scripts
*/

CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable full-text search on description
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS description_vector tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', description)) STORED;

CREATE INDEX IF NOT EXISTS scripts_description_vector_idx ON scripts USING gin(description_vector);

-- Enable Row Level Security
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON scripts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);