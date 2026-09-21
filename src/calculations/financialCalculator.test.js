import { 
  calculatePriceInstallment, 
  calculateSACInstallment, 
  calculateSettlementSavings, 
  calculateLoanComparison,
  calculateMonthlyCapacity,
  calculateEarlyPayment
} from './financialCalculator';

describe('Motor Financeiro - QUITA+', () => {

  test('Exemplo 1: Tabela PRICE R$ 10.000 em 12x a 2% a.m.', () => {
    const res = calculatePriceInstallment(10000, 2, 12);
    expect(res.monthlyPayment).toBeCloseTo(945.60, 1);
    expect(res.totalCost).toBeGreaterThan(10000);
    expect(res.totalInterest).toBeCloseTo(res.totalCost - 10000, 2);
  });

  test('Exemplo 2: Tabela SAC R$ 10.000 em 12x a 2% a.m.', () => {
    const res = calculateSACInstallment(10000, 2, 12);
    expect(res.firstInstallment).toBeGreaterThan(res.lastInstallment);
    expect(res.totalCost).toBeGreaterThan(10000);
  });

  test('Exemplo 3: Economia de quitação antecipada com desconto', () => {
    const res = calculateSettlementSavings(10000, 8000);
    expect(res.savings).toBe(2000);
    expect(res.discountPercentage).toBe(20);
  });

  test('Exemplo 4: Empréstimo Maior que a Dívida (Alerta de Excedente)', () => {
    const currentDebts = [
      { totalInstallments: 12, paidInstallments: 0, installmentAmount: 1000, settlementAmount: 10000, status: 'Ativa' }
    ];
    const comparison = calculateLoanComparison({
      currentDebtsList: currentDebts,
      loanAmountRequested: 15000,
      monthlyInterestRate: 2,
      termMonths: 24,
      amortizationSystem: 'PRICE'
    });

    expect(comparison.loanScenario.excessCash).toBe(5000);
    expect(comparison.comparison.hasMonthlyReduction).toBe(true);
  });

  test('Exemplo 5: Antecipação de Parcela em 2 meses a 2% a.m.', () => {
    const res = calculateEarlyPayment(500, 2, 2);
    expect(res.presentValue).toBeLessThan(500);
    expect(res.discount).toBeGreaterThan(0);
  });

});