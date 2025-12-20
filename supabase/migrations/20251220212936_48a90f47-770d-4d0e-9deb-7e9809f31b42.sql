-- Change reference_id from UUID to TEXT to support both local state IDs and Supabase UUIDs
ALTER TABLE public.messages 
ALTER COLUMN reference_id TYPE text;