-- Add phone_number and address columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number text,
ADD COLUMN address text;