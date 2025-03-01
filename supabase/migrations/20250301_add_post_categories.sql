-- Add category to posts table
ALTER TABLE posts ADD COLUMN category TEXT;

-- Create categories enum type for validation
CREATE TYPE blog_category AS ENUM (
  'Technology', 
  'Lifestyle', 
  'Food', 
  'Travel', 
  'Society', 
  'Finance', 
  'Anime', 
  'Movies', 
  'Health', 
  'Science', 
  'Education', 
  'Sports', 
  'Business', 
  'Art', 
  'Music',
  'Other'
);

-- Add category_ml column for ML-detected category
ALTER TABLE posts ADD COLUMN category_ml blog_category;

-- Create function to update category_ml when content changes
CREATE OR REPLACE FUNCTION update_post_category_ml()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be filled in by our ML service
  -- For now, just set it to NULL to be updated later
  NEW.category_ml = NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when content is updated
CREATE TRIGGER update_post_category_ml_trigger
BEFORE INSERT OR UPDATE OF content ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_category_ml();
