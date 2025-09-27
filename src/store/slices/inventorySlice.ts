import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  nom: string;
  description_courte: string;
  description_longue: string;
  categorie: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  code_barre?: string;
  qr_code?: string;
  images: string[];
  statut: 'active' | 'inactive' | 'discontinued';
  date_creation: string;
}

interface InventoryState {
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string;
    status: string;
    search: string;
  };
  view: 'list' | 'kanban' | 'grid';
  loading: boolean;
}

const initialState: InventoryState = {
  products: [],
  selectedProduct: null,
  filters: {
    category: '',
    status: '',
    search: '',
  },
  view: 'list',
  loading: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setView: (state, action: PayloadAction<'list' | 'kanban' | 'grid'>) => {
      state.view = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setSelectedProduct,
  setFilters,
  setView,
  setLoading,
} = inventorySlice.actions;

export default inventorySlice.reducer;