-- Add reporting functionality to comments table
ALTER TABLE comments
ADD COLUMN reported BOOLEAN DEFAULT false,
ADD COLUMN report_reason TEXT;

-- Create index for faster querying of reported comments
CREATE INDEX idx_comments_reported ON comments(reported);

-- Create policy to allow users to report comments
CREATE POLICY "Users can report comments"
  ON comments FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    -- Only allow updating the reported and report_reason fields
    (OLD.content = NEW.content) AND
    (OLD.post_id = NEW.post_id) AND
    (OLD.user_id = NEW.user_id) AND
    (OLD.created_at = NEW.created_at)
  );

-- Create policy to allow admins to manage reported comments
CREATE POLICY "Admins can manage reported comments"
  ON comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
