
import { useState, useCallback } from 'react';

interface ProductStore {
  selectedProductId: number | null;
  searchFilter: string;
  categoryFilter: string;
  setSelectedProduct: (id: number | null) => void;
  setSearchFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  clearFilters: () => void;
}

export const useProductStore = (): ProductStore => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const setSelectedProduct = useCallback((id: number | null) => {
    setSelectedProductId(id);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilter('');
    setCategoryFilter('Todas');
    setSelectedProductId(null);
  }, []);

  return {
    selectedProductId,
    searchFilter,
    categoryFilter,
    setSelectedProduct,
    setSearchFilter,
    setCategoryFilter,
    clearFilters
  };
};
