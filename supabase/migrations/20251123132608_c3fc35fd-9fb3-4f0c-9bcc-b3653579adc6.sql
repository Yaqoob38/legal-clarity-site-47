-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_profile_created_create_demo_case ON public.profiles;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_demo_case_for_user();

-- Create updated function with all tasks
CREATE OR REPLACE FUNCTION public.create_demo_case_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_case_id UUID;
BEGIN
  -- Create a demo case
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
    15
  ) RETURNING id INTO new_case_id;

  -- Create Stage 1 tasks (Onboarding & AML)
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_1', 'Client Care Letter', 'Review and sign the client care letter', 'COMPLETE', 0, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Upload ID Documents', 'Please upload a clear copy of your passport or driving licence for identity verification', 'IN_PROGRESS', 1, ARRAY['Passport', 'Driving Licence']),
    (new_case_id, 'STAGE_1', 'Complete Thirdfort AML Check', 'Complete the Thirdfort identity verification process. Click the link to begin verification.', 'NOT_STARTED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Client Information Form', 'Please complete your personal details, contact information, and property preferences', 'NOT_STARTED', 3, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Source of Funds Declaration', 'Upload proof of funds for this purchase (bank statements, mortgage offer, etc.)', 'NOT_STARTED', 4, ARRAY['Bank Statement', 'Mortgage Offer', 'Sale Proceeds Statement']),
    (new_case_id, 'STAGE_1', 'Giftor Information (If Applicable)', 'If receiving a gift towards the purchase, upload giftor details and gift declaration form', 'NOT_STARTED', 5, ARRAY['Giftor ID', 'Gift Declaration Form', 'Bank Statement']);

  -- Create Stage 2 tasks (Contract Stage) - locked initially
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_2', 'Local Authority Search', 'Awaiting local authority search results from the council', 'LOCKED', 1, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Water & Drainage Search', 'Awaiting water and drainage search results', 'LOCKED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Upload Signed Contract', 'Please review and upload your signed contract of sale', 'LOCKED', 3, ARRAY['Signed Contract']),
    (new_case_id, 'STAGE_2', 'Upload Signed Plans', 'Upload the signed property plans and boundary documents', 'LOCKED', 4, ARRAY['Signed Plans', 'Boundary Certificate']),
    (new_case_id, 'STAGE_2', 'Upload Final Exchange Form', 'Complete and upload the final exchange form', 'LOCKED', 5, ARRAY['Exchange Form']);

  -- Create Stage 3 tasks (Exchange Stage) - locked initially
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_3', 'Upload Deposit Transfer Receipt', 'Upload proof of deposit transfer to our client account', 'LOCKED', 1, ARRAY['Bank Transfer Receipt', 'Payment Confirmation']),
    (new_case_id, 'STAGE_3', 'Upload Legal Fee Receipt', 'Upload proof of payment for legal fees', 'LOCKED', 2, ARRAY['Payment Receipt', 'Invoice']),
    (new_case_id, 'STAGE_3', 'Final Completion Confirmation', 'Awaiting completion confirmation from solicitor. No action required from you.', 'LOCKED', 3, ARRAY[]::TEXT[]);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    NEW.id,
    'Welcome to Your Client Portal',
    'Your case has been set up. Start by uploading your ID documents to begin the process.',
    '/dashboard'
  );

  -- Create calendar events
  INSERT INTO public.calendar_events (case_id, title, description, event_date, event_type) VALUES
    (new_case_id, 'Contract Exchange Deadline', 'Target date for exchange of contracts', CURRENT_DATE + INTERVAL '21 days', 'Deadline'),
    (new_case_id, 'Completion Date', 'Expected completion and move-in date', CURRENT_DATE + INTERVAL '35 days', 'Completion'),
    (new_case_id, 'Initial Consultation', 'Review case and discuss next steps', CURRENT_DATE + INTERVAL '2 days', 'Meeting');

  RETURN NEW;
END;
$function$;

-- Create trigger to call the function when a profile is created
CREATE TRIGGER on_profile_created_create_demo_case
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_demo_case_for_user();