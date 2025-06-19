
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center justify-center mb-12">
      {categories.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-slate-900/80 text-white hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-8 max-w-4xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            className={`
              flex-shrink-0 px-6 py-2 rounded-full transition-all duration-300 whitespace-nowrap
              ${selectedCategory === category
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {category}
          </Button>
        ))}
      </div>

      {categories.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-slate-900/80 text-white hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default CategoryFilter;
