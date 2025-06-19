
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Searching products for query:', query);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate embedding for the search query
    const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
      body: { text: query }
    });

    if (embeddingResponse.error) {
      console.error('Error generating embedding:', embeddingResponse.error);
      throw new Error('Failed to generate embedding for search query');
    }

    const queryEmbedding = embeddingResponse.data.embedding;

    // Search for similar products using the RPC function
    const { data: similarProducts, error: searchError } = await supabase
      .rpc('search_similar_products', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });

    if (searchError) {
      console.error('Error searching similar products:', searchError);
      throw new Error('Failed to search similar products');
    }

    console.log('Found similar products:', similarProducts?.length || 0);

    return new Response(JSON.stringify({ 
      products: similarProducts || [],
      query: query 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in search-products function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      products: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
