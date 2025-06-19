
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  similarity: number;
}

interface ProductSuggestionsProps {
  products: Product[];
}

const ProductSuggestions = ({ products }: ProductSuggestionsProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-cyan-400 mb-2">
        Productos recomendados:
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {products.slice(0, 3).map((product) => (
          <Card key={product.id} className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-slate-400 ml-1">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-cyan-400 font-bold">
                      ${product.price}
                    </span>
                    <span className="text-xs text-green-400">
                      {(product.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductSuggestions;
