import { useFinancial } from '../context/FinancialContext';

export function useDebts() {
  const { 
    debts, 
    loadingData, 
    addOrUpdateDebt, 
    removeDebt, 
    handlePayInstallment 
  } = useFinancial();

  /**
   * Filtra apenas dívidas ativas (não quitadas)
   */
  const activeDebts = debts.filter((d) => d.status !== 'Quitada');

  /**
   * Filtra dívidas ordenadas por maior taxa de juros (Estratégia Avalanche)
   */
  const debtsByHighestInterest = [...activeDebts].sort(
    (a, b) => (b.monthlyInterestRate || 0) - (a.monthlyInterestRate || 0)
  );

  /**
   * Filtra dívidas ordenadas por menor saldo devedor (Estratégia Bola de Neve)
   */
  const debtsByLowestBalance = [...activeDebts].sort(
    (a, b) => (a.remainingAmount || 0) - (b.remainingAmount || 0)
  );

  /**
   * Obtém os detalhes de uma dívida específica por ID
   */
  const getDebtById = (id) => debts.find((d) => d.id === id);

  return {
    debts,
    activeDebts,
    debtsByHighestInterest,
    debtsByLowestBalance,
    loadingData,
    getDebtById,
    addOrUpdateDebt,
    removeDebt,
    payInstallment: handlePayInstallment
  };
}