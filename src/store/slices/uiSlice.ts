import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  modals: {
    productForm: boolean;
    customerForm: boolean;
    saleForm: boolean;
    projectForm: boolean;
  };
  loading: {
    global: boolean;
    dashboard: boolean;
    products: boolean;
    sales: boolean;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  language: 'fr',
  currency: 'XOF',
  notifications: [],
  modals: {
    productForm: false,
    customerForm: false,
    saleForm: false,
    projectForm: false,
  },
  loading: {
    global: false,
    dashboard: false,
    products: false,
    sales: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setLanguage,
  setCurrency,
  addNotification,
  markNotificationRead,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;