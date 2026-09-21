import { useFinancial } from '../context/FinancialContext';
import { calculateLoanComparison } from '../calculations/financialCalculator';

export function useSimulations() {
  const { simulations, saveSimulation } = useFinancial();

  /**
   * Executa a simulação sem salvar imediatamente (preview)
   */
  const runSimulation = ({
    selectedDebts,
    loanAmount,
    interestRate,
    termMonths,
    amortizationSystem = 'PRICE'
  }) => {
    return calculateLoanComparison({
      currentDebtsList: selectedDebts,
      loanAmountRequested: Number(loanAmount),
      monthlyInterestRate: Number(interestRate),
      termMonths: Number(termMonths),
      amortizationSystem
    });
  };

  /**
   * Executa e salva a simulação no Firestore
   */
  const createAndSaveSimulation = async (simulationName, params) => {
    const result = runSimulation(params);

    const simulationData = {
      simulationName: simulationName || 'Nova Simulação',
      selectedDebtIds: params.selectedDebts.map((d) => d.id),
      loanAmount: Number(params.loanAmount),
      interestRate: Number(params.interestRate),
      termMonths: Number(params.termMonths),
      amortizationSystem: params.amortizationSystem || 'PRICE',
      results: result
    };

    await saveSimulation(simulationData);
    return result;
  };

  return {
    simulations,
    runSimulation,
    createAndSaveSimulation
  };
}