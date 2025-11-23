-- Create enum for task status
CREATE TYPE task_status AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS', 
  'SUBMITTED',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'LOCKED',
  'COMPLETE'
);

-- Create enum for case stage
CREATE TYPE case_stage AS ENUM (
  'STAGE_1',
  'STAGE_2',
  'STAGE_3'
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  property_postcode TEXT,
  case_reference TEXT NOT NULL UNIQUE,
  case_type TEXT NOT NULL DEFAULT 'Conveyancing - Sale',
  stage case_stage NOT NULL DEFAULT 'STAGE_1',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  stage case_stage NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'NOT_STARTED',
  required_documents TEXT[],
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view their own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Users can update their own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = client_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks for their cases"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = tasks.case_id
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their cases"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = tasks.case_id
      AND cases.client_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents for their cases"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = documents.case_id
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their cases"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = documents.case_id
      AND cases.client_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their cases"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = messages.case_id
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their cases"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = messages.case_id
      AND cases.client_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view calendar events for their cases"
  ON public.calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = calendar_events.case_id
      AND cases.client_id = auth.uid()
    )
  );

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false);

-- Storage policies for case documents
CREATE POLICY "Users can view their own case documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own case documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own case documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create triggers for updated_at
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to create demo case for new users
CREATE OR REPLACE FUNCTION public.create_demo_case_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    25
  ) RETURNING id INTO new_case_id;

  -- Create Stage 1 tasks
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_1', 'Upload ID Documents', 'Please upload a clear copy of your passport or driving licence', 'IN_PROGRESS', 1, ARRAY['Passport', 'Driving Licence']),
    (new_case_id, 'STAGE_1', 'Complete AML Check', 'Complete the Thirdfort identity verification process', 'NOT_STARTED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Client Information Form', 'Please complete your personal and contact details', 'NOT_STARTED', 3, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_1', 'Source of Funds', 'Upload proof of funds for this purchase', 'NOT_STARTED', 4, ARRAY['Bank Statement', 'Mortgage Offer']),
    (new_case_id, 'STAGE_1', 'Client Care Letter', 'Review and sign the client care letter', 'COMPLETE', 0, ARRAY[]::TEXT[]);

  -- Create Stage 2 tasks (locked initially)
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_2', 'Local Authority Search', 'Awaiting search results from local council', 'LOCKED', 1, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Water & Drainage', 'Awaiting water and drainage search results', 'LOCKED', 2, ARRAY[]::TEXT[]),
    (new_case_id, 'STAGE_2', 'Upload Signed Contract', 'Please upload your signed contract of sale', 'LOCKED', 3, ARRAY['Signed Contract']);

  -- Create Stage 3 tasks (locked initially)
  INSERT INTO public.tasks (case_id, stage, title, description, status, order_index, required_documents) VALUES
    (new_case_id, 'STAGE_3', 'Deposit Transfer', 'Upload proof of deposit transfer', 'LOCKED', 1, ARRAY['Bank Transfer Receipt']),
    (new_case_id, 'STAGE_3', 'Legal Fee Payment', 'Upload proof of legal fee payment', 'LOCKED', 2, ARRAY['Payment Receipt']),
    (new_case_id, 'STAGE_3', 'Final Confirmation', 'Awaiting completion confirmation', 'LOCKED', 3, ARRAY[]::TEXT[]);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    NEW.id,
    'Welcome to Your Client Portal',
    'Your case has been set up. Start by uploading your ID documents.',
    '/dashboard'
  );

  -- Create some calendar events
  INSERT INTO public.calendar_events (case_id, title, description, event_date, event_type) VALUES
    (new_case_id, 'Contract Exchange Deadline', 'Target date for exchange of contracts', CURRENT_DATE + INTERVAL '21 days', 'Deadline'),
    (new_case_id, 'Completion Date', 'Expected completion and move-in date', CURRENT_DATE + INTERVAL '35 days', 'Completion');

  RETURN NEW;
END;
$$;

-- Trigger to create demo case when profile is created
CREATE TRIGGER on_profile_created_create_demo_case
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_demo_case_for_user();