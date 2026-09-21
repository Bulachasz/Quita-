import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { FinancialCalendarView } from '../components/calendar/FinancialCalendarView';

export default function CalendarPage() {
  const { debts } = useFinancial();

  // Mapear parcelas de todas as dívidas para a agenda
  const installments = debts.map(debt => ({
    debtName: debt.name,
    dueDate: debt.dueDate || 'Não informada',
    amount: debt.installmentAmount,
    status: debt.status === 'Quitada' ? 'Paga' : 'Pendente'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Calendário Financeiro</h2>
        <p className="text-xs text-gray-500">Visualização de vencimentos e programação de pagamentos</p>
      </div>

      <FinancialCalendarView installments={installments} />
    </div>
  );
}