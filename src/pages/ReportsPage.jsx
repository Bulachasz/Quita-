import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { FinancialReportPDF } from '../components/reports/FinancialReportPDF';

export default function ReportsPage() {
  const { metrics } = useFinancial();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Relatórios e Exportação</h2>
        <p className="text-xs text-gray-500">Gere resumos impressos ou em PDF para guardar seu progresso</p>
      </div>

      <FinancialReportPDF data={metrics} />
    </div>
  );
}