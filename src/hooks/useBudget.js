import { useFinancial } from '../context/FinancialContext';

export function useBudget() {
  const { budget, metrics, updateBudgetSettings } = useFinancial();

  const income = budget.income || 0;
  const expenses = budget.expenses || 0;
  const monthlyDebts = metrics.monthlyCommitment || 0;

  // Calculo de Dinheiro Disponível Total após Despesas Fixas
  const netIncome = Math.max(0, income - expenses);

  // Renda Restante após pagar as Dívidas Atuais
  const availableAfterDebts = netIncome - monthlyDebts;

  // Porcentagem de Comprometimento da Renda Líquida com Dívidas
  const debtCommitmentPercentage = netIncome > 0 
    ? Math.min(100, Math.round((monthlyDebts / netIncome) * 100))
    : 0;

  return {
    income,
    expenses,
    netIncome,
    monthlyDebts,
    availableAfterDebts,
    debtCommitmentPercentage,
    updateBudget: updateBudgetSettings
  };
}