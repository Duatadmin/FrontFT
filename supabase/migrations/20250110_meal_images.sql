-- Create meal_images table to store uploaded meal photo metadata
CREATE TABLE IF NOT EXISTS meal_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudflare_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  
  -- Nutrition data (to be filled by AI analysis)
  meal_name TEXT,
  calories INTEGER,
  protein_g DECIMAL(10,2),
  carbs_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  fiber_g DECIMAL(10,2),
  sugar_g DECIMAL(10,2),
  sodium_mg DECIMAL(10,2),
  
  -- AI analysis metadata
  analysis_date TIMESTAMP WITH TIME ZONE,
  confidence_score DECIMAL(3,2),
  ingredients JSONB
);

-- Create indexes for performance
CREATE INDEX idx_meal_images_user_id ON meal_images(user_id);
CREATE INDEX idx_meal_images_created_at ON meal_images(created_at DESC);

-- Enable RLS
ALTER TABLE meal_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own meal images"
  ON meal_images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal images"
  ON meal_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal images"
  ON meal_images
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal images"
  ON meal_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE meal_images IS 'Stores meal photo uploads and nutrition analysis data';