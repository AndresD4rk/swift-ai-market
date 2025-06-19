
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);

        if (error) {
          throw error;
        }

        const uniqueCategories = Array.from(
          new Set(data?.map(item => item.category).filter(Boolean))
        );
        
        setCategories(['All', ...uniqueCategories.sort()]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories if there's an error
        setCategories(['All', 'Electronics', 'Computing', 'Displays', 'Security', 'Smart Home']);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
