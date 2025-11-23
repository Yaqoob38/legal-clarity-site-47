-- Drop the email-based claim policy
DROP POLICY IF EXISTS "Users can claim their invited cases" ON public.cases;

-- Update the link_invited_case trigger to use invitation_token from signup metadata
CREATE OR REPLACE FUNCTION public.link_invited_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  case_id UUID;
  invite_token TEXT;
BEGIN
  -- Get invitation token from user metadata
  invite_token := NEW.raw_user_meta_data->>'invitation_token';
  
  IF invite_token IS NOT NULL THEN
    -- Find and link invitation case
    UPDATE public.cases
    SET client_id = NEW.id
    WHERE invitation_token = invite_token
      AND client_id IS NULL
    RETURNING id INTO case_id;
    
    -- Create notification if case was linked
    IF case_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, link)
      VALUES (NEW.id, 'Welcome!', 'Your case is ready.', '/dashboard');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;