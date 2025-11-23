-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy for user_roles: admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update cases table to add admin_id and invitation_token
ALTER TABLE public.cases
ADD COLUMN admin_id UUID REFERENCES auth.users(id),
ADD COLUMN invitation_token TEXT UNIQUE,
ADD COLUMN client_email TEXT;

-- Update handle_new_user function to assign 'client' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  
  -- Assign client role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$function$;

-- Update create_demo_case_for_user to only create demo case if user has no invitation token
CREATE OR REPLACE FUNCTION public.create_demo_case_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_case_id UUID;
  invitation_case_id UUID;
BEGIN
  -- Check if user signed up via invitation
  SELECT id INTO invitation_case_id
  FROM public.cases
  WHERE client_email = NEW.email
    AND client_id IS NULL
  LIMIT 1;

  -- If invitation case exists, link it to the user
  IF invitation_case_id IS NOT NULL THEN
    UPDATE public.cases
    SET client_id = NEW.id
    WHERE id = invitation_case_id;
    
    -- Create welcome notification
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
      NEW.id,
      'Welcome to Your Client Portal',
      'Your case has been set up. Please start by completing the Client Care Letter & ID task.',
      '/dashboard'
    );
    
    RETURN NEW;
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

  -- Create Stage 1 tasks
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents, downloadable_documents) VALUES
    (new_case_id, 'STAGE_1', 'Client Care Letter & ID', 
     'This is your first step in the conveyancing process. Please carefully review the Client Care Letter which outlines our terms of service, fee structure, and your rights as a client. Once reviewed, you will need to download the document, sign it, and upload it back to us along with a clear copy of your identification (passport or driving licence). This helps us verify your identity and comply with anti-money laundering regulations.', 
     'NOT_STARTED', 0, 
     ARRAY['Signed Client Care Letter', 'Passport or Driving Licence'],
     ARRAY['Client_Care_Letter.pdf', 'Terms_of_Engagement.pdf']),
    (new_case_id, 'STAGE_1', 'Complete Thirdfort AML Check', 
     'Thirdfort is our trusted partner for secure identity verification. You will receive an email with a unique link to complete the verification process. This typically takes 5-10 minutes and can be done on your phone or computer. You will need to scan your ID document and take a selfie. This process ensures compliance with UK anti-money laundering regulations.', 
     'LOCKED', 1, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Client Information Form', 
     'Please complete our comprehensive client information form. This includes your personal details, contact information, employment details, and property preferences. Accurate information here helps us serve you better and speeds up the conveyancing process. The form should take approximately 15 minutes to complete.', 
     'LOCKED', 2, 
     ARRAY['Completed Client Information Form'],
     ARRAY['Client_Information_Form.pdf', 'ID_Verification_Guide.pdf']),
    (new_case_id, 'STAGE_1', 'Source of Funds Declaration', 
     'UK law requires us to verify the source of funds for your property purchase. Please upload documentation proving where your funds are coming from. This could include recent bank statements (last 3 months), mortgage offer letter, proof of sale proceeds from another property, or evidence of gifts. All documents should clearly show your name and the available funds.', 
     'LOCKED', 3, 
     ARRAY['Bank Statements (Last 3 Months)', 'Mortgage Offer Letter', 'Sale Proceeds Statement'],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Giftor Information (If Applicable)', 
     'If you are receiving financial assistance (gift) towards your purchase, we need information about the person providing the gift. This includes their identification documents, a signed gift declaration form confirming the funds are a gift with no expectation of repayment, and evidence of their available funds. This is required for anti-money laundering compliance.', 
     'LOCKED', 4, 
     ARRAY['Giftor ID Document', 'Signed Gift Declaration Form', 'Giftor Bank Statements'],
     ARRAY['Gift_Declaration_Form.pdf']);

  -- Create Stage 2 tasks
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents, downloadable_documents) VALUES
    (new_case_id, 'STAGE_2', 'Local Authority Search', 
     'We will conduct comprehensive searches with the local authority to check for planning permissions, building regulations, local development plans, and any issues that might affect your property. This search typically takes 7-14 working days. You do not need to take any action for this task - we handle it on your behalf.', 
     'LOCKED', 1, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Water & Drainage Search', 
     'This search confirms the water supply and sewerage arrangements for the property. It will show whether the property is connected to mains drainage, if there are any water charges outstanding, and the location of water pipes. Results typically arrive within 5-10 working days. No action required from you.', 
     'LOCKED', 2, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Review and Sign Contract', 
     'Once we receive all search results and are satisfied with the legal title, we will send you the draft contract of sale for your review. Please read it carefully, and if you are happy to proceed, sign and upload it back to us. We recommend discussing any concerns with us before signing.', 
     'LOCKED', 3, 
     ARRAY['Signed Contract of Sale'],
     ARRAY['Draft_Contract_of_Sale.pdf']),
    (new_case_id, 'STAGE_2', 'Upload Signed Plans', 
     'Along with the contract, you will need to sign the property plans which show the boundaries of the property you are purchasing. Please ensure you sign all pages where indicated and upload the complete set of plans.', 
     'LOCKED', 4, 
     ARRAY['Signed Property Plans', 'Boundary Certificate'],
     ARRAY['Property_Plans.pdf']),
    (new_case_id, 'STAGE_2', 'Exchange Readiness Confirmation', 
     'Before we can exchange contracts, we need to confirm that your mortgage offer is in place (if applicable), your deposit funds are ready to transfer, and all parties are ready to proceed. We will contact you to confirm these details before proceeding to exchange.', 
     'LOCKED', 5, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]);

  -- Create Stage 3 tasks
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents, downloadable_documents) VALUES
    (new_case_id, 'STAGE_3', 'Transfer Deposit Funds', 
     'Once we are ready to exchange contracts, you will need to transfer your deposit to our client account. We will provide you with our bank details and the exact amount required. Please allow 3-5 working days for the transfer to clear. Upload proof of the transfer once completed.', 
     'LOCKED', 1, 
     ARRAY['Bank Transfer Receipt', 'Payment Confirmation'],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_3', 'Pay Legal Fees', 
     'Our legal fees and disbursements (search fees, land registry fees, etc.) are due before completion. We will send you a final invoice with a complete breakdown of all costs. Please transfer the payment to our client account and upload proof of payment.', 
     'LOCKED', 2, 
     ARRAY['Payment Receipt', 'Invoice'],
     ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_3', 'Completion Confirmation', 
     'On completion day, we will transfer the balance of funds to the seller''s solicitor and register your ownership with the Land Registry. You will receive the keys to your new property! We will confirm completion and send you all relevant documents. This typically happens between 12pm-2pm on the agreed completion date. Congratulations on your new home!', 
     'LOCKED', 3, 
     ARRAY[]::TEXT[],
     ARRAY[]::TEXT[]);

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

-- RLS policies for cases: admins can view all cases
CREATE POLICY "Admins can view all cases"
ON public.cases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for cases: admins can insert cases
CREATE POLICY "Admins can create cases"
ON public.cases
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for cases: admins can update all cases
CREATE POLICY "Admins can update all cases"
ON public.cases
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for tasks: admins can view all tasks
CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = tasks.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);

-- RLS policies for tasks: admins can update all tasks
CREATE POLICY "Admins can update all tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = tasks.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);

-- RLS policies for documents: admins can view all documents
CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = documents.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);

-- RLS policies for messages: admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = messages.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);

-- RLS policies for messages: admins can insert messages
CREATE POLICY "Admins can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = messages.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);