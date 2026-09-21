import React from 'react';
import { Button } from '../common/Button';

export function FinancialReportPDF({ data }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-gray-800">Relatório Financeiro QUITA+</h3>
          <p className="text-xs text-gray-500">Resumo consolidado de dívidas e simulações</p>
        </div>
        <Button onClick={handlePrint} variant="outline">🖨️ Exportar PDF / Imprimir</Button>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl text-xs space-y-2 text-gray-600">
        <p>• Dívidas Totais Cadastradas: <strong>{data?.debtCount || 0}</strong></p>
        <p>• Comprometimento Mensal: <strong>R$ {data?.monthlyCommitment || '0,00'}</strong></p>
        <p>• Progresso Geral: <strong>{data?.progressPercentage || 0}%</strong></p>
      </div>
    </div>
  );
}