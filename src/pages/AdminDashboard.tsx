import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Package, Activity, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PopularProductsTable from '@/components/admin/PopularProductsTable';
import ActiveSessionsChart from '@/components/admin/ActiveSessionsChart';
import ProductForm from '@/components/admin/ProductForm';
import RealtimeMetrics from '@/components/admin/RealtimeMetrics';

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

interface ActiveSession {
  product_id: number;
  product_name: string;
  active_sessions: number;
}

const AdminDashboard = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const navigate = useNavigate();

  // Fetch popular products
  const { data: popularProducts, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_popular_products');
      if (error) throw error;
      return data as PopularProduct[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch active sessions
  const { data: activeSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_sessions_per_product');
      if (error) throw error;
      return data as ActiveSession[];
    },
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Calculate metrics
  const totalProducts = popularProducts?.length || 0;
  const totalSessions = activeSessions?.reduce((sum, item) => sum + Number(item.active_sessions), 0) || 0;
  const avgRating = popularProducts?.reduce((sum, product) => sum + Number(product.rating), 0) / totalProducts || 0;

  const handleProductAdded = () => {
    refetchProducts();
    setShowProductForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-slate-400 hover:text-white mr-4 p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-4xl font-bold text-white">Panel de Administración</h1>
              </div>
              <p className="text-slate-400">Gestiona productos y monitorea métricas en tiempo real</p>
            </div>
            <Button
              onClick={() => setShowProductForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Productos</p>
                  <p className="text-2xl font-bold text-white">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Sesiones Activas</p>
                  <p className="text-2xl font-bold text-white">{totalSessions}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-white">{avgRating.toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <RealtimeMetrics />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-cyan-600">
              Productos Populares
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-cyan-600">
              Sesiones Activas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">
              Analíticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <PopularProductsTable 
              products={popularProducts || []} 
              isLoading={loadingProducts} 
            />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <ActiveSessionsChart 
              sessions={activeSessions || []} 
              isLoading={loadingSessions} 
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Products by Category Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Productos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={popularProducts?.reduce((acc, product) => {
                          const category = product.category || 'Sin categoría';
                          const existing = acc.find(item => item.name === category);
                          if (existing) {
                            existing.value += 1;
                          } else {
                            acc.push({ name: category, value: 1 });
                          }
                          return acc;
                        }, [] as Array<{ name: string; value: number }>) || []}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#06b6d4"
                      >
                        {popularProducts?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Distribución de Calificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={popularProducts?.map(product => ({
                      name: product.name.substring(0, 10) + '...',
                      rating: Number(product.rating),
                      reviews: product.reviews
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="rating" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm 
            onClose={() => setShowProductForm(false)}
            onProductAdded={handleProductAdded}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
