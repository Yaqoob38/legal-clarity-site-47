CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'client'
);


--
-- Name: case_stage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.case_stage AS ENUM (
    'STAGE_1',
    'STAGE_2',
    'STAGE_3'
);


--
-- Name: task_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.task_status AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'LOCKED',
    'COMPLETE'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: handle_user_signup(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_user_signup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: link_invited_case(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_invited_case() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    event_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    property_address text NOT NULL,
    property_postcode text,
    case_reference text NOT NULL,
    case_type text DEFAULT 'Conveyancing - Sale'::text NOT NULL,
    stage public.case_stage DEFAULT 'STAGE_1'::public.case_stage NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    admin_id uuid,
    invitation_token text,
    client_email text,
    CONSTRAINT cases_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    task_id uuid,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    file_type text,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    stage public.case_stage NOT NULL,
    title text NOT NULL,
    description text,
    status public.task_status DEFAULT 'NOT_STARTED'::public.task_status NOT NULL,
    required_documents text[],
    notes text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    downloadable_documents text[]
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: cases cases_case_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_reference_key UNIQUE (case_reference);


--
-- Name: cases cases_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_invitation_token_key UNIQUE (invitation_token);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: cases update_cases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: calendar_events calendar_events_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: cases cases_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: cases cases_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: documents documents_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: documents documents_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);


--
-- Name: messages messages_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: cases Admins can create cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tasks Admins can create tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = tasks.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: cases Admins can delete cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert any roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert any roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: messages Admins can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = messages.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: cases Admins can update all cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all cases" ON public.cases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tasks Admins can update all tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all tasks" ON public.tasks FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = tasks.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: user_roles Admins can update any roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cases Admins can view all cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all cases" ON public.cases FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can view all documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = documents.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: messages Admins can view all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = messages.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tasks Admins can view all tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all tasks" ON public.tasks FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = tasks.case_id) AND public.has_role(auth.uid(), 'admin'::public.app_role)))));


--
-- Name: documents Users can delete their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING ((uploaded_by = auth.uid()));


--
-- Name: documents Users can insert documents for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert documents for their cases" ON public.documents FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = documents.case_id) AND (cases.client_id = auth.uid())))) AND (uploaded_by = auth.uid())));


--
-- Name: messages Users can insert messages for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert messages for their cases" ON public.messages FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = messages.case_id) AND (cases.client_id = auth.uid())))) AND (sender_id = auth.uid())));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_roles Users can insert their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: tasks Users can update tasks for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update tasks for their cases" ON public.tasks FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = tasks.case_id) AND (cases.client_id = auth.uid())))));


--
-- Name: cases Users can update their own cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own cases" ON public.cases FOR UPDATE USING ((auth.uid() = client_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: calendar_events Users can view calendar events for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view calendar events for their cases" ON public.calendar_events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = calendar_events.case_id) AND (cases.client_id = auth.uid())))));


--
-- Name: documents Users can view documents for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents for their cases" ON public.documents FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = documents.case_id) AND (cases.client_id = auth.uid())))));


--
-- Name: messages Users can view messages for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages for their cases" ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = messages.case_id) AND (cases.client_id = auth.uid())))));


--
-- Name: tasks Users can view tasks for their cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view tasks for their cases" ON public.tasks FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cases
  WHERE ((cases.id = tasks.case_id) AND (cases.client_id = auth.uid())))));


--
-- Name: cases Users can view their own cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own cases" ON public.cases FOR SELECT USING ((auth.uid() = client_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: calendar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


