import { useState, createContext, useContext, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ManageProductsPage } from './pages/ManageProductsPage';
import { ManageCategoriesPage } from './pages/ManageCategoriesPage';
import { SettingsPage } from './pages/SettingsPage';

// Navigation Context
const NavContext = createContext<{ activeTab: string; setActiveTab: (t: string) => void } | null>(null);

export const useNav = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("No NavContext");
  return ctx;
};

import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('pos');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Reset to POS if user logs out or changes
    if (isAuthenticated) {
      setActiveTab('pos');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pos':
        return <PosPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'manage-products':
        // Admin only
        if (user?.role !== 'admin') return <DashboardPage />;
        return <ManageProductsPage />;
      case 'categories':
        // Admin only
        if (user?.role !== 'admin') return <DashboardPage />;
        return <ManageCategoriesPage />;
      case 'settings':
        // Admin only
        if (user?.role !== 'admin') return <DashboardPage />;
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab }}>
      {renderPage()}
    </NavContext.Provider>
  );
}

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
