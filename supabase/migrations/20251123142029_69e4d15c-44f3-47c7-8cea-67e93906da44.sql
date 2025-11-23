-- Fix the create_demo_case_for_user trigger to properly link invited users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.create_demo_case_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_case_id UUID;
  invitation_case_id UUID;
  user_email TEXT;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Log for debugging
  RAISE NOTICE 'User created: % with email: %', NEW.id, user_email;
  
  -- Check if user signed up via invitation by matching email
  IF user_email IS NOT NULL THEN
    SELECT id INTO invitation_case_id
    FROM public.cases
    WHERE client_email = user_email
      AND client_id IS NULL
    LIMIT 1;

    RAISE NOTICE 'Found invitation case: %', invitation_case_id;

    -- If invitation case exists, link it to the user and create tasks
    IF invitation_case_id IS NOT NULL THEN
      UPDATE public.cases
      SET client_id = NEW.id
      WHERE id = invitation_case_id;
      
      -- Only create tasks if they don't exist for this case
      INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents, downloadable_documents)
      SELECT 
        invitation_case_id,
        'STAGE_1',
        'Client Care Letter & ID',
        'This is your first step in the conveyancing process. Please carefully review the Client Care Letter which outlines our terms of service, fee structure, and your rights as a client.',
        'NOT_STARTED',
        0,
        ARRAY['Signed Client Care Letter', 'Passport or Driving Licence'],
        ARRAY['Client_Care_Letter.pdf', 'Terms_of_Engagement.pdf']
      WHERE NOT EXISTS (
        SELECT 1 FROM public.tasks WHERE case_id = invitation_case_id
      );
      
      -- Create welcome notification
      INSERT INTO public.notifications (user_id, title, message, link)
      VALUES (
        NEW.id,
        'Welcome to Your Client Portal',
        'Your case has been set up. Please start by completing the Client Care Letter & ID task.',
        '/dashboard'
      );
      
      RAISE NOTICE 'Successfully linked case and created tasks';
      RETURN NEW;
    END IF;
  END IF;

  -- Create a demo case only if no invitation
  INSERT INTO public.cases (
    client_id,
    property_address,
    property_postcode,
    case_reference,
    stage,
    progress
  ) VALUES (
    NEW.id,
    '49 Russell Square',
    'WC1B 4JP',
    'REF-' || SUBSTRING(NEW.id::text, 1, 4),
    'STAGE_1',
    0
  ) RETURNING id INTO new_case_id;

  -- Create demo tasks
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents, downloadable_documents) VALUES
    (new_case_id, 'STAGE_1', 'Client Care Letter & ID', 
     'This is your first step in the conveyancing process.',
     'NOT_STARTED', 0, 
     ARRAY['Signed Client Care Letter', 'Passport or Driving Licence'],
     ARRAY['Client_Care_Letter.pdf', 'Terms_of_Engagement.pdf']),
    (new_case_id, 'STAGE_1', 'Complete Thirdfort AML Check', 
     'Complete identity verification through Thirdfort.',
     'LOCKED', 1, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    NEW.id,
    'Welcome to Your Client Portal',
    'Your case has been set up.',
    '/dashboard'
  );

  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_demo_case_for_user();