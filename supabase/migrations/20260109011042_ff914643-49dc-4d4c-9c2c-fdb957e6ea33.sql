-- Add budget_category column to orders table to link orders to budget items
ALTER TABLE public.orders 
ADD COLUMN budget_category text;

-- Create an index for faster lookups
CREATE INDEX idx_orders_budget_category ON public.orders(budget_category);