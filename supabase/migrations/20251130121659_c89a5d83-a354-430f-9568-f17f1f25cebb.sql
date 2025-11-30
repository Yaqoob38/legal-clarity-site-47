-- Function to link user to case after signup
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_token_value TEXT;
BEGIN
  -- Extract invitation token from user metadata
  invitation_token_value := NEW.raw_user_meta_data->>'invitation_token';
  
  -- If invitation token exists, link user to case
  IF invitation_token_value IS NOT NULL THEN
    UPDATE public.cases
    SET client_id = NEW.id
    WHERE invitation_token = invitation_token_value
    AND client_id IS NULL;
  END IF;
  
  -- Create client role for the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create profile for the user
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_signup();