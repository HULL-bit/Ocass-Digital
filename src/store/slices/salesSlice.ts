import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Sale {
  id: string;
  numero_facture: string;
  client: {
    id: string;
    nom: string;
    email: string;
  };
  date_creation: string;
  statut: 'pending' | 'completed' | 'cancelled';
  sous_total: number;
  taxe_montant: number;
  remise_montant: number;
  total_ttc: number;
  mode_paiement: 'cash' | 'card' | 'wave' | 'orange_money';
  statut_paiement: 'pending' | 'paid' | 'failed';
  items: Array<{
    produit_id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
  }>;
}

interface SalesState {
  sales: Sale[];
  currentSale: Partial<Sale> | null;
  cart: Array<{
    produit_id: string;
    nom: string;
    prix_unitaire: number;
    quantite: number;
    total: number;
  }>;
  selectedCustomer: any | null;
  paymentMethod: string;
  loading: boolean;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  cart: [],
  selectedCustomer: null,
  paymentMethod: 'cash',
  loading: false,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload;
    },
    addToCart: (state, action: PayloadAction<{
      produit_id: string;
      nom: string;
      prix_unitaire: number;
      quantite: number;
    }>) => {
      const existingItem = state.cart.find(item => item.produit_id === action.payload.produit_id);
      if (existingItem) {
        existingItem.quantite += action.payload.quantite;
        existingItem.total = existingItem.quantite * existingItem.prix_unitaire;
      } else {
        state.cart.push({
          ...action.payload,
          total: action.payload.quantite * action.payload.prix_unitaire,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.produit_id !== action.payload);
    },
    updateCartItem: (state, action: PayloadAction<{
      produit_id: string;
      quantite: number;
    }>) => {
      const item = state.cart.find(item => item.produit_id === action.payload.produit_id);
      if (item) {
        item.quantite = action.payload.quantite;
        item.total = item.quantite * item.prix_unitaire;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setSelectedCustomer: (state, action: PayloadAction<any>) => {
      state.selectedCustomer = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    setCurrentSale: (state, action: PayloadAction<Partial<Sale> | null>) => {
      state.currentSale = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setSales,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  setSelectedCustomer,
  setPaymentMethod,
  setCurrentSale,
  setLoading,
} = salesSlice.actions;

export default salesSlice.reducer;