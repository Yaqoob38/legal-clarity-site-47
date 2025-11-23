-- Allow users to claim cases by linking client_id when client_email matches their email
CREATE POLICY "Users can claim their invited cases"
ON public.cases
FOR UPDATE
USING (
  client_email = auth.email() AND client_id IS NULL
)
WITH CHECK (
  client_id = auth.uid()
);