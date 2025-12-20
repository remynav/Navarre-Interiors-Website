-- Create table for linking products to mood boards
CREATE TABLE public.board_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mood_board_id UUID NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.product_inventory(id) ON DELETE CASCADE,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mood_board_id, product_id)
);

-- Create table for product favorites
CREATE TABLE public.product_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.product_inventory(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create table for client-uploaded inspiration images
CREATE TABLE public.client_board_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mood_board_id UUID NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.board_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_board_images ENABLE ROW LEVEL SECURITY;

-- RLS for board_products
CREATE POLICY "Admins can manage board products"
ON public.board_products
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view board products for their projects"
ON public.board_products
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM mood_boards mb
  JOIN projects p ON mb.project_id = p.id
  WHERE mb.id = board_products.mood_board_id AND p.client_id = auth.uid()
));

CREATE POLICY "Clients can add products to their boards"
ON public.board_products
FOR INSERT
WITH CHECK (
  auth.uid() = added_by AND
  EXISTS (
    SELECT 1 FROM mood_boards mb
    JOIN projects p ON mb.project_id = p.id
    WHERE mb.id = board_products.mood_board_id AND p.client_id = auth.uid()
  )
);

CREATE POLICY "Clients can remove products from their boards"
ON public.board_products
FOR DELETE
USING (
  added_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM mood_boards mb
    JOIN projects p ON mb.project_id = p.id
    WHERE mb.id = board_products.mood_board_id AND p.client_id = auth.uid()
  )
);

-- RLS for product_favorites
CREATE POLICY "Users can manage their own favorites"
ON public.product_favorites
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all favorites"
ON public.product_favorites
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS for client_board_images
CREATE POLICY "Admins can manage client board images"
ON public.client_board_images
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view images on their boards"
ON public.client_board_images
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM mood_boards mb
  JOIN projects p ON mb.project_id = p.id
  WHERE mb.id = client_board_images.mood_board_id AND p.client_id = auth.uid()
));

CREATE POLICY "Clients can upload images to their boards"
ON public.client_board_images
FOR INSERT
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM mood_boards mb
    JOIN projects p ON mb.project_id = p.id
    WHERE mb.id = client_board_images.mood_board_id AND p.client_id = auth.uid()
  )
);

CREATE POLICY "Clients can delete their own uploaded images"
ON public.client_board_images
FOR DELETE
USING (auth.uid() = uploaded_by);