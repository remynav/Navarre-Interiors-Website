-- Storage policies for documents bucket
CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clients can view their documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.projects p ON d.project_id = p.id
    WHERE d.file_url LIKE '%' || storage.objects.name AND p.client_id = auth.uid() AND d.status IN ('sent', 'archived')
  )
);

CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for images bucket (public for viewing)
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND public.has_role(auth.uid(), 'admin')
);