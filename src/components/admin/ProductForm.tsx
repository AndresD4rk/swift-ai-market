
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const ProductForm = ({ onClose, onProductAdded }: ProductFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    rating: '4.5',
    reviews: '10'
  });

  const generateEmbedding = async (text: string) => {
    try {
      console.log('Generating embedding for:', text);
      
      const response = await supabase.functions.invoke('generate-embedding', {
        body: { text }
      });

      if (response.error) {
        console.error('Embedding error:', response.error);
        throw response.error;
      }

      console.log('Embedding generated successfully');
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return null if embedding generation fails - product will still be created
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine name and description for embedding
      const textForEmbedding = `${formData.name} ${formData.description}`;
      
      // Generate embedding using Gemini
      const embedding = await generateEmbedding(textForEmbedding);

      // Insert product into database - use TablesInsert type which doesn't require id
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          rating: parseFloat(formData.rating),
          reviews: parseInt(formData.reviews),
          embedding: embedding
        } as any) // Using 'as any' to bypass the strict typing issue
        .select();

      if (error) throw error;

      toast({
        title: "Producto agregado",
        description: `${formData.name} ha sido agregado exitosamente.`,
      });

      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Package className="w-5 h-5 mr-2 text-cyan-400" />
              Agregar Nuevo Producto
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nombre del Producto</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: iPhone 15 Pro"
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300">Categoría</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ej: Smartphones"
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe las características y beneficios del producto..."
                className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-300">Precio ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="999.99"
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-slate-300">Rating</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviews" className="text-slate-300">Reviews</Label>
                <Input
                  id="reviews"
                  name="reviews"
                  type="number"
                  min="0"
                  value={formData.reviews}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-slate-300">URL de Imagen</Label>
              <Input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  'Agregar Producto'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
