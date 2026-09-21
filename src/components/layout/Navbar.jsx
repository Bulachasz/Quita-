import React from 'react';

export function Navbar({ user, onLogout, onFastSimulate }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium hidden sm:inline">Bem-vindo(a),</span>
        <span className="font-semibold text-gray-800">{user?.displayName || user?.email?.split('@')[0] || 'Usuário'}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onFastSimulate}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          ⚡ Simulação Rápida
        </button>
        <button
          onClick={onLogout}
          className="text-gray-500 hover:text-red-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}