-- Create a public storage bucket for downloadable document templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-templates', 'document-templates', true);

-- Create policies for public read access
CREATE POLICY "Public can view document templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'document-templates');

-- Create policy for authenticated users to upload templates (admin only in practice)
CREATE POLICY "Authenticated users can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'document-templates' 
  AND auth.role() = 'authenticated'
);