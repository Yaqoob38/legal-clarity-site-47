-- Allow admins to delete cases
CREATE POLICY "Admins can delete cases"
ON public.cases
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));