
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PopularProduct {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  session_count: number;
}

interface PopularProductsTableProps {
  products: PopularProduct[];
  isLoading: boolean;
}

const PopularProductsTable = ({ products, isLoading }: PopularProductsTableProps) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
            Productos Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
          Productos Más Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Producto</TableHead>
              <TableHead className="text-slate-300">Categoría</TableHead>
              <TableHead className="text-slate-300">Precio</TableHead>
              <TableHead className="text-slate-300">Rating</TableHead>
              <TableHead className="text-slate-300">Sesiones IA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-slate-700">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-slate-400 text-sm truncate max-w-[200px]">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-white font-semibold">${product.price}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white">{Number(product.rating).toFixed(1)}</span>
                    <span className="text-slate-400">({product.reviews})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 font-semibold">
                      {Number(product.session_count)}
                    </span>
                    <span className="text-slate-400">sesiones</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PopularProductsTable;
