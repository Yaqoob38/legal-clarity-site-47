-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created_create_demo_case ON public.profiles;

-- Now drop function with CASCADE
DROP FUNCTION IF EXISTS public.create_demo_case_for_user() CASCADE;

-- Create new streamlined function
CREATE FUNCTION public.link_invited_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  case_id UUID;
  user_email TEXT;
BEGIN
  -- Get email - it's directly accessible in auth.users trigger
  user_email := NEW.email;
  
  IF user_email IS NOT NULL THEN
    -- Find and link invitation case
    UPDATE public.cases
    SET client_id = NEW.id
    WHERE client_email = user_email
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

-- Create trigger on auth.users only
CREATE TRIGGER link_case_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_invited_case();