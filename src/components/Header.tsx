
import React from 'react';
import { ShoppingCart, User, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  cartCount: number;
}

const Header = ({ cartCount }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">FM</span>
            </div>
            <span className="text-white text-xl font-semibold">FutureMarket</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
              Products
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
              Categories
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
              Deals
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
              Support
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/admin')}
              title="Admin Dashboard"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
