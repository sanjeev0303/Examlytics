import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  activeStreamingQuestionId: string | null;
  dashboardPeriod: 'day' | 'week' | 'month';
}

const initialState: UIState = {
  theme: 'system',
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  activeStreamingQuestionId: null,
  dashboardPeriod: 'week',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setActiveStreamingQuestion: (state, action: PayloadAction<string | null>) => {
      state.activeStreamingQuestionId = action.payload;
    },
    setDashboardPeriod: (state, action: PayloadAction<'day' | 'week' | 'month'>) => {
      state.dashboardPeriod = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveStreamingQuestion,
  setDashboardPeriod
} = uiSlice.actions;

export default uiSlice.reducer;
