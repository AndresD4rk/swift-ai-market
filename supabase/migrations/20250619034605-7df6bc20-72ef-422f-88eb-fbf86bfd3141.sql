
-- Create admin_sessions table to track Gemini Live sessions
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  user_identifier TEXT, -- Could be IP or session ID since we don't have auth
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since no auth system)
CREATE POLICY "Public can manage admin sessions" 
  ON public.admin_sessions 
  FOR ALL 
  USING (true);

-- Create function to get popular products
CREATE OR REPLACE FUNCTION get_popular_products()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  price NUMERIC,
  rating NUMERIC,
  reviews INTEGER,
  image TEXT,
  category TEXT,
  description TEXT,
  session_count BIGINT
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.price,
    p.rating,
    p.reviews,
    p.image,
    p.category,
    p.description,
    COUNT(s.id) as session_count
  FROM public.products p
  LEFT JOIN public.admin_sessions s ON p.id = s.product_id
  GROUP BY p.id, p.name, p.price, p.rating, p.reviews, p.image, p.category, p.description
  ORDER BY session_count DESC, p.rating DESC
$$;

-- Create function to get active sessions per product
CREATE OR REPLACE FUNCTION get_active_sessions_per_product()
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  active_sessions BIGINT
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COUNT(s.id) as active_sessions
  FROM public.products p
  LEFT JOIN public.admin_sessions s ON p.id = s.product_id AND s.status = 'active'
  GROUP BY p.id, p.name
  ORDER BY active_sessions DESC
$$;

-- Enable realtime for admin_sessions table
ALTER TABLE public.admin_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
