import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';

// Layout e Modais com imports nomeados para alinhar com os exports
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { FastSimulationModal } from './components/simulations/FastSimulationModal';

// Páginas
import Dashboard from './pages/Dashboard';
import DebtsPage from './pages/DebtsPage';
import CardsPage from './pages/CardsPage';
import BudgetPage from './pages/BudgetPage';
import SimulationsPage from './pages/SimulationsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';

function MainApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFastSimOpen, setIsFastSimOpen] = useState(false);

  if (!user) return <AuthPage />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'debts':
        return <DebtsPage />;
      case 'cards':
        return <CardsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'simulations':
        return <SimulationsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <FinancialProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Menu Lateral para telas médias e grandes */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* Barra Superior */}
          <Navbar user={user} onLogout={logout} onFastSimulate={() => setIsFastSimOpen(true)} />
          
          {/* Conteúdo Principal */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </main>
        </div>

        {/* Menu de Navegação Inferior para Celulares */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Modal de Simulação Rápida */}
        <FastSimulationModal isOpen={isFastSimOpen} onClose={() => setIsFastSimOpen(false)} />
      </div>
    </FinancialProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}