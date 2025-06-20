
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
    const { message, chatHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chat message:', message);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for relevant products based on the user message
    const searchResponse = await supabase.functions.invoke('search-products', {
      body: { query: message }
    });

    let contextProducts = [];
    let highSimilarityProducts = [];
    
    if (searchResponse.data && searchResponse.data.products) {
      contextProducts = searchResponse.data.products;
      // Filter products with high similarity (>= 0.7) for suggestions
      highSimilarityProducts = contextProducts.filter((product: any) => product.similarity >= 0.7);
    }

    console.log('Found context products:', contextProducts.length);
    console.log('High similarity products (>=0.7):', highSimilarityProducts.length);

    // Build context from similar products (use all for context, but only show high similarity ones)
    let productContext = '';
    if (contextProducts.length > 0) {
      productContext = '\n\nProductos relevantes disponibles:\n';
      contextProducts.forEach((product: any, index: number) => {
        productContext += `${index + 1}. ${product.name}
   - Precio: $${product.price}
   - Categoría: ${product.category}
   - Rating: ${product.rating}/5 (${product.reviews} reseñas)
   - Descripción: ${product.description}
   - Similitud: ${(product.similarity * 100).toFixed(1)}%\n\n`;
      });
    }

    // Build conversation history for Gemini
    const conversationHistory = chatHistory.map((msg: any) => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // System prompt for the AI assistant
    const systemPrompt = `Eres un asistente de compras inteligente especializado en ayudar a los usuarios a encontrar productos. Tu objetivo es:

1. Ayudar a los usuarios a encontrar productos que se ajusten a sus necesidades
2. Proporcionar información detallada sobre productos específicos
3. Hacer recomendaciones basadas en las preferencias del usuario
4. Comparar productos cuando sea relevante
5. Responder preguntas sobre características, precios y disponibilidad

Siempre responde en español de manera amigable y profesional. Cuando tengas información sobre productos relevantes, úsala para dar respuestas más precisas y útiles.

${productContext}

Si no encuentras productos relevantes para la consulta del usuario, aún puedes ayudar respondiendo preguntas generales sobre compras o pidiendo más detalles para hacer una mejor búsqueda.`;

    // Add current message to conversation
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...conversationHistory
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('Generated AI response');

    // Only return high similarity products for suggestions
    return new Response(JSON.stringify({ 
      response: aiResponse,
      contextProducts: highSimilarityProducts, // Only products with similarity >= 0.7
      productCount: highSimilarityProducts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
