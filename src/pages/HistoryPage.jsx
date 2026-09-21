import React from 'react';
import { useFinancial } from '../context/FinancialContext';

export default function HistoryPage() {
  const { history = [] } = useFinancial();

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800">📜 Histórico de Atividades</h2>
        <p className="text-sm text-gray-500">Linha do tempo auditável de pagamentos e alterações financeiras</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        {history.length > 0 ? (
          <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
            {history.map((item, idx) => {
              const formattedDate = item.date?.seconds
                ? new Date(item.date.seconds * 1000).toLocaleString('pt-BR')
                : 'Data recente';

              return (
                <div key={item.id || idx} className="relative pl-6">
                  {/* Ponto na linha do tempo */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs" />

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-800 text-sm block">
                        {item.description || item.action}
                      </span>
                      <span className="text-gray-400 mt-0.5 block">{formattedDate}</span>
                    </div>

                    {item.amount && (
                      <strong className="text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        {formatBRL(item.amount)}
                      </strong>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhuma atividade registrada no seu histórico ainda.
          </div>
        )}
      </div>
    </div>
  );
}