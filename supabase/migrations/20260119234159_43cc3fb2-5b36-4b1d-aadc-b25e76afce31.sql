-- Make order-receipts bucket private to require signed URLs for access
UPDATE storage.buckets SET public = false WHERE id = 'order-receipts';