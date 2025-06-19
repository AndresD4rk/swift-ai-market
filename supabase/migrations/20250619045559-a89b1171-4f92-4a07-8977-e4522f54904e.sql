
-- Create a function to search for similar products using vector similarity
CREATE OR REPLACE FUNCTION search_similar_products(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  name text,
  description text,
  price numeric,
  category text,
  image text,
  rating numeric,
  reviews integer,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.image,
    p.rating,
    p.reviews,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION search_similar_products TO anon, authenticated;
