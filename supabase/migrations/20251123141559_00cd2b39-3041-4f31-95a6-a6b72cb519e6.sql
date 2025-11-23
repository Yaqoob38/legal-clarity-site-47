-- Add INSERT policy for user_roles to allow users to insert their own roles
CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for admins to manage any roles
CREATE POLICY "Admins can insert any roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));