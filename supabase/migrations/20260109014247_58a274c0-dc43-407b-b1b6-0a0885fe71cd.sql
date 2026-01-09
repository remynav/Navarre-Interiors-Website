-- First drop the policy that depends on project_id
DROP POLICY IF EXISTS "Clients can view inventory for their projects" ON public.product_inventory;

-- Add price column to product_inventory
ALTER TABLE public.product_inventory 
ADD COLUMN price numeric DEFAULT NULL;

-- Remove project_id column (make inventory global)
ALTER TABLE public.product_inventory 
DROP COLUMN project_id;

-- Create new policy to allow clients to view all inventory
CREATE POLICY "Clients can view all inventory" 
ON public.product_inventory 
FOR SELECT 
USING (true);