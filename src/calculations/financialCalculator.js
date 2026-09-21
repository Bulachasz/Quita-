/**
 * Converte valor numérico em centavos inteiros para evitar imprecisões de ponto flutuante em JS.
 */
const toCents = (amount) => Math.round((Number(amount) || 0) * 100);
const toReal = (cents) => cents / 100;

/**
 * Tabela PRICE (Prestação Constante / Juros Compostos)
 * Formula: PMT = P * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
 */
export function calculatePriceInstallment(principal, monthlyRatePercent, totalMonths) {
  const p = toCents(principal);
  const i = (Number(monthlyRatePercent) || 0) / 100;
  const n = Number(totalMonths) || 0;

  if (p <= 0 || n <= 0) return { monthlyPayment: 0, totalCost: 0, totalInterest: 0 };

  if (i === 0) {
    const monthlyCents = Math.round(p / n);
    return {
      monthlyPayment: toReal(monthlyCents),
      totalCost: toReal(p),
      totalInterest: 0
    };
  }

  const factor = Math.pow(1 + i, n);
  const pmtCents = Math.round(p * ((i * factor) / (factor - 1)));
  const totalCostCents = pmtCents * n;
  const totalInterestCents = Math.max(0, totalCostCents - p);

  return {
    monthlyPayment: toReal(pmtCents),
    totalCost: toReal(totalCostCents),
    totalInterest: toReal(totalInterestCents)
  };
}

/**
 * Tabela SAC (Sistema de Amortização Constante - Parcelas Decrescentes)
 */
export function calculateSACInstallment(principal, monthlyRatePercent, totalMonths) {
  const p = toCents(principal);
  const i = (Number(monthlyRatePercent) || 0) / 100;
  const n = Number(totalMonths) || 0;

  if (p <= 0 || n <= 0) {
    return { firstInstallment: 0, lastInstallment: 0, averageInstallment: 0, totalCost: 0, totalInterest: 0 };
  }

  const amortizationPerMonthCents = p / n;
  let currentBalanceCents = p;
  let totalInterestCents = 0;
  let firstInstallmentCents = 0;
  let lastInstallmentCents = 0;

  for (let month = 1; month <= n; month++) {
    const interestForMonthCents = Math.round(currentBalanceCents * i);
    const installmentCents = Math.round(amortizationPerMonthCents + interestForMonthCents);

    if (month === 1) firstInstallmentCents = installmentCents;
    if (month === n) lastInstallmentCents = installmentCents;

    totalInterestCents += interestForMonthCents;
    currentBalanceCents -= amortizationPerMonthCents;
  }

  const totalCostCents = p + totalInterestCents;
  const averageInstallmentCents = Math.round((firstInstallmentCents + lastInstallmentCents) / 2);

  return {
    firstInstallment: toReal(firstInstallmentCents),
    lastInstallment: toReal(lastInstallmentCents),
    averageInstallment: toReal(averageInstallmentCents),
    totalCost: toReal(totalCostCents),
    totalInterest: toReal(totalInterestCents)
  };
}

/**
 * Economia em Quitação Antecipada por Oferta da Credora
 */
export function calculateSettlementSavings(remainingNominalBalance, settlementQuoteToday) {
  const nominalCents = toCents(remainingNominalBalance);
  const quoteCents = toCents(settlementQuoteToday);

  if (quoteCents >= nominalCents || nominalCents <= 0) {
    return { savings: 0, discountPercentage: 0 };
  }

  const savingsCents = nominalCents - quoteCents;
  const discountPercentage = (savingsCents / nominalCents) * 100;

  return {
    savings: toReal(savingsCents),
    discountPercentage: Number(discountPercentage.toFixed(2))
  };
}

/**
 * Comparador Transparente de Cenários (Manter Dívidas x Novo Empréstimo)
 */
export function calculateLoanComparison({
  currentDebtsList = [],
  loanAmountRequested = 0,
  monthlyInterestRate = 0,
  termMonths = 1,
  amortizationSystem = 'PRICE'
}) {
  let totalCurrentNominalRemainingCents = 0;
  let totalCurrentMonthlyCommitmentCents = 0;
  let totalCurrentSettlementQuoteCents = 0;

  currentDebtsList.forEach((debt) => {
    const totalInst = Number(debt.totalInstallments) || 0;
    const paidInst = Number(debt.paidInstallments) || 0;
    const instAmountCents = toCents(debt.installmentAmount);
    const remainingCount = Math.max(0, totalInst - paidInst);

    const nominalDebtRemainingCents = remainingCount * instAmountCents;
    totalCurrentNominalRemainingCents += nominalDebtRemainingCents;
    
    if (debt.status !== 'Quitada') {
      totalCurrentMonthlyCommitmentCents += instAmountCents;
    }

    const settlementCents = debt.settlementAmount ? toCents(debt.settlementAmount) : 0;
    totalCurrentSettlementQuoteCents += (settlementCents > 0 ? settlementCents : nominalDebtRemainingCents);
  });

  const loanCalc = amortizationSystem === 'SAC'
    ? calculateSACInstallment(loanAmountRequested, monthlyInterestRate, termMonths)
    : calculatePriceInstallment(loanAmountRequested, monthlyInterestRate, termMonths);

  const newMonthlyPayment = amortizationSystem === 'SAC' ? loanCalc.averageInstallment : loanCalc.monthlyPayment;
  const newTotalCost = loanCalc.totalCost;

  const currentMonthly = toReal(totalCurrentMonthlyCommitmentCents);
  const currentNominal = toReal(totalCurrentNominalRemainingCents);
  const currentSettlement = toReal(totalCurrentSettlementQuoteCents);

  const monthlySavings = currentMonthly - newMonthlyPayment;
  const totalCostDifference = newTotalCost - currentNominal;
  const requestedCents = toCents(loanAmountRequested);

  const excessCash = Math.max(0, toReal(requestedCents - totalCurrentSettlementQuoteCents));
  const pendingDebtBalance = Math.max(0, toReal(totalCurrentSettlementQuoteCents - requestedCents));

  return {
    currentScenario: {
      totalNominalRemaining: currentNominal,
      monthlyCommitment: currentMonthly,
      settlementQuoteNeeded: currentSettlement
    },
    loanScenario: {
      loanAmount: Number(loanAmountRequested),
      monthlyPayment: newMonthlyPayment,
      totalCost: newTotalCost,
      totalInterest: loanCalc.totalInterest,
      excessCash,
      pendingDebtBalance
    },
    comparison: {
      monthlySavings: Number(monthlySavings.toFixed(2)),
      totalCostDifference: Number(totalCostDifference.toFixed(2)),
      hasTotalCostIncrease: totalCostDifference > 0,
      hasMonthlyReduction: monthlySavings > 0
    }
  };
}

/**
 * Calculadora de Capacidade Mensal ("Quanto consigo financiar com a parcela que posso pagar?")
 */
export function calculateMonthlyCapacity(maxMonthlyPayment, monthlyRatePercent, termMonths) {
  const pmtCents = toCents(maxMonthlyPayment);
  const i = (Number(monthlyRatePercent) || 0) / 100;
  const n = Number(termMonths) || 0;

  if (pmtCents <= 0 || n <= 0) return { financiableAmount: 0, totalCost: 0, totalInterest: 0 };

  if (i === 0) {
    const totalCents = pmtCents * n;
    return { financiableAmount: toReal(totalCents), totalCost: toReal(totalCents), totalInterest: 0 };
  }

  const factor = Math.pow(1 + i, n);
  const principalCents = Math.round(pmtCents * ((factor - 1) / (i * factor)));
  const totalCostCents = pmtCents * n;
  const totalInterestCents = totalCostCents - principalCents;

  return {
    financiableAmount: toReal(principalCents),
    totalCost: toReal(totalCostCents),
    totalInterest: toReal(totalInterestCents)
  };
}

/**
 * Calculadora de Antecipação de Parcelas Individuais com Desconto Proporcional
 */
export function calculateEarlyPayment(installmentAmount, monthlyRatePercent, monthsAhead = 1) {
  const pmtCents = toCents(installmentAmount);
  const i = (Number(monthlyRatePercent) || 0) / 100;
  const k = Number(monthsAhead) || 1;

  if (pmtCents <= 0) return { presentValue: 0, discount: 0 };

  // Valor Presente: PV = FV / (1 + i)^k
  const pvCents = Math.round(pmtCents / Math.pow(1 + i, k));
  const discountCents = pmtCents - pvCents;

  return {
    presentValue: toReal(pvCents),
    discount: toReal(discountCents)
  };
}