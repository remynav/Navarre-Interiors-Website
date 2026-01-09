-- Add receipt_url column to orders table
ALTER TABLE public.orders ADD COLUMN receipt_url text;

-- Create storage bucket for order receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-receipts', 'order-receipts', true);

-- Allow admins to upload receipts
CREATE POLICY "Admins can upload order receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update receipts
CREATE POLICY "Admins can update order receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'order-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete receipts
CREATE POLICY "Admins can delete order receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'order-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow clients and admins to view receipts
CREATE POLICY "Users can view order receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-receipts' AND
  auth.uid() IS NOT NULL
);