import React from 'react';

const mobileItems = [
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'debts', label: 'Dívidas', icon: '💳' },
  { id: 'budget', label: 'Orçamento', icon: '💰' },
  { id: 'simulations', label: 'Simular', icon: '📊' },
  { id: 'calendar', label: 'Agenda', icon: '📅' },
];

export function MobileNav({ activeTab, setActiveTab }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 z-40">
      <div className="flex justify-around items-center">
        {mobileItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition ${
              activeTab === item.id ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}