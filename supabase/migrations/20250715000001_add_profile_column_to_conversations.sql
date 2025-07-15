-- Add profile column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN profile TEXT;