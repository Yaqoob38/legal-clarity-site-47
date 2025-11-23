-- Add INSERT policy for tasks: admins can create tasks for any case
CREATE POLICY "Admins can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = tasks.case_id
      AND public.has_role(auth.uid(), 'admin')
  )
);

-- Also add UPDATE policy for user_roles so admins can manage roles
CREATE POLICY "Admins can update any roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add DELETE policy for user_roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));