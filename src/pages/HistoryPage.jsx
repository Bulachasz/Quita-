import React from 'react';
import { useFinancial } from '../context/FinancialContext';

export default function HistoryPage() {
  const { history } = useFinancial();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Histórico de Atividades</h2>
        <p className="text-xs text-gray-500">Registro completo de ações, pagamentos e alterações</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-800">{item.description}</p>
                  <span className="text-gray-400">{item.action}</span>
                </div>
                {item.amount && <strong className="text-emerald-600 text-sm">R$ {item.amount}</strong>}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm py-8">Nenhum evento registrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}