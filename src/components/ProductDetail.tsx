
import React from 'react';
import { Star, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: number) => void;
}

const ProductDetail = ({ product, onClose, onAddToCart }: ProductDetailProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl bg-slate-900/95 border-cyan-500/30 shadow-2xl">
          <CardContent className="p-0">
            {/* Header with back button */}
            <div className="p-6 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-600/20">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al catálogo
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Badge className="absolute top-4 left-4 bg-cyan-500/80 text-white text-sm px-3 py-1">
                    {product.category}
                  </Badge>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                      {product.name}
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">
                      {product.rating} / 5
                    </span>
                    <span className="text-slate-400">
                      ({product.reviews} reseñas)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="py-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      ${product.price}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => onAddToCart(product.id)}
                    className="w-full py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Agregar al Carrito
                  </Button>

                  {/* Additional Info */}
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Información del Producto</h3>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex justify-between">
                        <span>Categoría:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID del Producto:</span>
                        <span>#{product.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disponibilidad:</span>
                        <span className="text-green-400">En Stock</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
