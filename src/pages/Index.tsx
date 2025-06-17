
import React, { useState } from 'react';
import { Search, ShoppingCart, MessageCircle, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import AIAssistant from '@/components/AIAssistant';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';

const sampleProducts = [
  {
    id: 1,
    name: "Neural Interface Headset",
    price: 899.99,
    rating: 4.8,
    reviews: 324,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    category: "Electronics",
    description: "Advanced brain-computer interface for seamless digital interaction"
  },
  {
    id: 2,
    name: "Quantum Processing Unit",
    price: 1299.99,
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=400&h=300&fit=crop",
    category: "Computing",
    description: "Next-generation quantum processor for ultra-fast computing"
  },
  {
    id: 3,
    name: "Holographic Display",
    price: 2499.99,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    category: "Displays",
    description: "3D holographic display with 360-degree viewing angles"
  },
  {
    id: 4,
    name: "Smart Biometric Scanner",
    price: 349.99,
    rating: 4.6,
    reviews: 542,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    category: "Security",
    description: "Advanced biometric authentication system"
  },
  {
    id: 5,
    name: "Wireless Power Hub",
    price: 199.99,
    rating: 4.5,
    reviews: 278,
    image: "https://images.unsplash.com/photo-1609592827389-d45bc12a2eff?w=400&h=300&fit=crop",
    category: "Electronics",
    description: "Universal wireless charging station for all devices"
  },
  {
    id: 6,
    name: "AI Voice Assistant",
    price: 449.99,
    rating: 4.8,
    reviews: 712,
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=300&fit=crop",
    category: "Smart Home",
    description: "Advanced AI assistant with natural language processing"
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const categories = ['All', 'Electronics', 'Computing', 'Displays', 'Security', 'Smart Home'];

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: number) => {
    setCartCount(prev => prev + 1);
    console.log(`Added product ${productId} to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      
      <Header cartCount={cartCount} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Future Marketplace
          </h1>
          <p className="text-xl text-slate-300 mb-8">Discover tomorrow's technology today</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for futuristic products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-slate-400 rounded-2xl focus:bg-white/20 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistant isOpen={showAI} onToggle={() => setShowAI(!showAI)} />

      {/* Floating AI Button */}
      <Button
        onClick={() => setShowAI(!showAI)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Index;
