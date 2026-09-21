import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';

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
import HelpPage from './pages/HelpPage';

// Modais Globais
import { FastSimulationModal } from './components/simulations/FastSimulationModal';

function MainApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFastSimulateOpen, setIsFastSimulateOpen] = useState(false);

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
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
        return <Dashboard setActiveTab={setActiveTab} />;
        case 'help':
        return <HelpPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <FinancialProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900">
        {/* Menu Lateral Desktop */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar
            user={user}
            onLogout={logout}
            onFastSimulate={() => setIsFastSimulateOpen(true)}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {renderContent()}
          </main>
        </div>

        {/* Navegação Inferior Mobile */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Modal Global de Simulação Rápida */}
        <FastSimulationModal
          isOpen={isFastSimulateOpen}
          onClose={() => setIsFastSimulateOpen(false)}
        />
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