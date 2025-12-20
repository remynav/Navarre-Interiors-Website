-- Add optional reference columns to messages table for item-based questions
ALTER TABLE public.messages 
ADD COLUMN reference_type text,
ADD COLUMN reference_id uuid,
ADD COLUMN reference_title text,
ADD COLUMN reference_image_url text;

-- Add comment to explain the reference_type values
COMMENT ON COLUMN public.messages.reference_type IS 'Type of referenced item: rendering, design_item, document, or null for regular messages';