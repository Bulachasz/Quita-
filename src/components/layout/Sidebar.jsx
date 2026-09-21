import React from 'react';

const menuItems = [
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'debts', label: 'Minhas Dívidas', icon: '💳' },
  { id: 'cards', label: 'Cartões de Crédito', icon: '💳' },
  { id: 'budget', label: 'Meu Orçamento', icon: '💰' },
  { id: 'simulations', label: 'Simulador QUITA+', icon: '📊' },
  { id: 'calendar', label: 'Calendário', icon: '📅' },
  { id: 'reports', label: 'Relatórios', icon: '📈' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

export function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen p-4 border-r border-slate-800">
      <div className="flex items-center gap-2 px-3 py-4 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
          Q+
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-wide text-white">QUITA+</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Auxiliador Financeiro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}