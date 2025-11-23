-- Make client_id nullable in cases table since admins create cases before clients sign up
ALTER TABLE public.cases ALTER COLUMN client_id DROP NOT NULL;