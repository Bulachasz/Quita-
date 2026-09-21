import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import FastSimulationModal from './components/simulations/FastSimulationModal';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DebtsPage from './pages/DebtsPage';
import CardsPage from './pages/CardsPage';
import BudgetPage from './pages/BudgetPage';
import SimulationsPage from './pages/SimulationsPage';
import CalendarPage from './pages/CalendarPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFastSimOpen, setIsFastSimOpen] = useState(false);

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddDebt={() => setActiveTab('debts')} onStartSimulation={() => setActiveTab('simulations')} />;
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
      case 'history':
        return <HistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Menu Lateral Desktop */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* Topbar */}
          <Navbar
            user={user}
            onLogout={logout}
            onFastSimulate={() => setIsFastSimOpen(true)}
          />

          {/* Área Principal de Conteúdo */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </main>
        </div>

        {/* Navegação Inferior Mobile */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Modal de Simulação Rápida */}
        <FastSimulationModal
          isOpen={isFastSimOpen}
          onClose={() => setIsFastSimOpen(false)}
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