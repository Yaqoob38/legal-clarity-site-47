-- Update the create_demo_case_for_user function to set first task as NOT_STARTED
-- and all other tasks as LOCKED

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
    0
  ) RETURNING id INTO new_case_id;

  -- Create Stage 1 tasks - first one NOT_STARTED, rest LOCKED
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_1', 'Client Care Letter & ID', 
     'This is your first step in the conveyancing process. Please carefully review the Client Care Letter which outlines our terms of service, fee structure, and your rights as a client. Once reviewed, you will need to download the document, sign it, and upload it back to us along with a clear copy of your identification (passport or driving licence). This helps us verify your identity and comply with anti-money laundering regulations.', 
     'NOT_STARTED', 0, ARRAY['Signed Client Care Letter', 'Passport or Driving Licence']),
    (new_case_id, 'STAGE_1', 'Complete Thirdfort AML Check', 
     'Thirdfort is our trusted partner for secure identity verification. You will receive an email with a unique link to complete the verification process. This typically takes 5-10 minutes and can be done on your phone or computer. You will need to scan your ID document and take a selfie. This process ensures compliance with UK anti-money laundering regulations.', 
     'LOCKED', 1, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Client Information Form', 
     'Please complete our comprehensive client information form. This includes your personal details, contact information, employment details, and property preferences. Accurate information here helps us serve you better and speeds up the conveyancing process. The form should take approximately 15 minutes to complete.', 
     'LOCKED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Source of Funds Declaration', 
     'UK law requires us to verify the source of funds for your property purchase. Please upload documentation proving where your funds are coming from. This could include recent bank statements (last 3 months), mortgage offer letter, proof of sale proceeds from another property, or evidence of gifts. All documents should clearly show your name and the available funds.', 
     'LOCKED', 3, ARRAY['Bank Statements (Last 3 Months)', 'Mortgage Offer Letter', 'Sale Proceeds Statement']),
    (new_case_id, 'STAGE_1', 'Giftor Information (If Applicable)', 
     'If you are receiving financial assistance (gift) towards your purchase, we need information about the person providing the gift. This includes their identification documents, a signed gift declaration form confirming the funds are a gift with no expectation of repayment, and evidence of their available funds. This is required for anti-money laundering compliance.', 
     'LOCKED', 4, ARRAY['Giftor ID Document', 'Signed Gift Declaration Form', 'Giftor Bank Statements']);

  -- Create Stage 2 tasks (Contract Stage) - all locked
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_2', 'Local Authority Search', 
     'We will conduct comprehensive searches with the local authority to check for planning permissions, building regulations, local development plans, and any issues that might affect your property. This search typically takes 7-14 working days. You do not need to take any action for this task - we handle it on your behalf.', 
     'LOCKED', 1, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Water & Drainage Search', 
     'This search confirms the water supply and sewerage arrangements for the property. It will show whether the property is connected to mains drainage, if there are any water charges outstanding, and the location of water pipes. Results typically arrive within 5-10 working days. No action required from you.', 
     'LOCKED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Review and Sign Contract', 
     'Once we receive all search results and are satisfied with the legal title, we will send you the draft contract of sale for your review. Please read it carefully, and if you are happy to proceed, sign and upload it back to us. We recommend discussing any concerns with us before signing.', 
     'LOCKED', 3, ARRAY['Signed Contract of Sale']),
    (new_case_id, 'STAGE_2', 'Upload Signed Plans', 
     'Along with the contract, you will need to sign the property plans which show the boundaries of the property you are purchasing. Please ensure you sign all pages where indicated and upload the complete set of plans.', 
     'LOCKED', 4, ARRAY['Signed Property Plans', 'Boundary Certificate']),
    (new_case_id, 'STAGE_2', 'Exchange Readiness Confirmation', 
     'Before we can exchange contracts, we need to confirm that your mortgage offer is in place (if applicable), your deposit funds are ready to transfer, and all parties are ready to proceed. We will contact you to confirm these details before proceeding to exchange.', 
     'LOCKED', 5, ARRAY[]::TEXT[]);

  -- Create Stage 3 tasks (Exchange & Completion) - all locked
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_3', 'Transfer Deposit Funds', 
     'Once we are ready to exchange contracts, you will need to transfer your deposit to our client account. We will provide you with our bank details and the exact amount required. Please allow 3-5 working days for the transfer to clear. Upload proof of the transfer once completed.', 
     'LOCKED', 1, ARRAY['Bank Transfer Receipt', 'Payment Confirmation']),
    (new_case_id, 'STAGE_3', 'Pay Legal Fees', 
     'Our legal fees and disbursements (search fees, land registry fees, etc.) are due before completion. We will send you a final invoice with a complete breakdown of all costs. Please transfer the payment to our client account and upload proof of payment.', 
     'LOCKED', 2, ARRAY['Payment Receipt', 'Invoice']),
    (new_case_id, 'STAGE_3', 'Completion Confirmation', 
     'On completion day, we will transfer the balance of funds to the seller''s solicitor and register your ownership with the Land Registry. You will receive the keys to your new property! We will confirm completion and send you all relevant documents. This typically happens between 12pm-2pm on the agreed completion date. Congratulations on your new home!', 
     'LOCKED', 3, ARRAY[]::TEXT[]);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    NEW.id,
    'Welcome to Your Client Portal',
    'Your case has been set up. Please start by completing the Client Care Letter & ID task.',
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