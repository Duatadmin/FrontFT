-- Add index for meal_type (column already exists)
CREATE INDEX IF NOT EXISTS idx_meal_images_meal_type ON meal_images(meal_type);

-- Add index for user_id and created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_images_user_created ON meal_images(user_id, created_at DESC);