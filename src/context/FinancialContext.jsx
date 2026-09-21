import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { registerInstallmentPayment } from '../firebase/firestoreService';

const FinancialContext = createContext();

export function FinancialProvider({ children }) {
  const { user } = useAuth();
  const [debts, setDebts] = useState([]);
  const [cards, setCards] = useState([]);
  const [budget, setBudget] = useState({ income: 0, expenses: 0 });
  const [simulations, setSimulations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Escutar Dívidas em Tempo Real
  useEffect(() => {
    if (!user) {
      setDebts([]);
      setCards([]);
      setSimulations([]);
      setHistory([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    const debtsRef = collection(db, `users/${user.uid}/debts`);
    const qDebts = query(debtsRef, orderBy('createdAt', 'desc'));
    const unsubDebts = onSnapshot(qDebts, (snapshot) => {
      const debtList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setDebts(debtList);
    }, (error) => console.error("Erro ao carregar dívidas:", error));

    // Escutar Cartões
    const cardsRef = collection(db, `users/${user.uid}/cards`);
    const unsubCards = onSnapshot(cardsRef, (snapshot) => {
      setCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Escutar Orçamento/Configurações
    const budgetRef = doc(db, `users/${user.uid}/settings/budget`);
    const unsubBudget = onSnapshot(budgetRef, (docSnap) => {
      if (docSnap.exists()) {
        setBudget(docSnap.data());
      }
    });

    // Escutar Simulações Salvas
    const simRef = collection(db, `users/${user.uid}/simulations`);
    const qSim = query(simRef, orderBy('createdAt', 'desc'));
    const unsubSim = onSnapshot(qSim, (snapshot) => {
      setSimulations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Escutar Histórico
    const historyRef = collection(db, `users/${user.uid}/history`);
    const qHistory = query(historyRef, orderBy('date', 'desc'));
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingData(false);
    });

    return () => {
      unsubDebts();
      unsubCards();
      unsubBudget();
      unsubSim();
      unsubHistory();
    };
  }, [user]);

  // Ações
  const addOrUpdateDebt = async (debtData, debtId = null) => {
    if (!user) return;
    const ref = debtId 
      ? doc(db, `users/${user.uid}/debts/${debtId}`) 
      : doc(collection(db, `users/${user.uid}/debts`));

    const original = Number(debtData.originalAmount) || 0;
    const totalInst = Number(debtData.totalInstallments) || 1;
    const paidInst = Number(debtData.paidInstallments) || 0;
    const instAmount = Number(debtData.installmentAmount) || 0;

    const remainingInst = Math.max(0, totalInst - paidInst);
    const paidAmount = paidInst * instAmount;
    const remainingAmount = remainingInst * instAmount;

    const payload = {
      name: debtData.name || 'Dívida',
      institution: debtData.institution || 'Geral',
      type: debtData.type || 'Outro',
      originalAmount: original,
      totalInstallments: totalInst,
      paidInstallments: paidInst,
      remainingInstallments: remainingInst,
      installmentAmount: instAmount,
      paidAmount,
      remainingAmount,
      monthlyInterestRate: Number(debtData.monthlyInterestRate) || 0,
      settlementAmount: debtData.settlementAmount ? Number(debtData.settlementAmount) : null,
      dueDate: debtData.dueDate || '',
      status: remainingInst === 0 ? 'Quitada' : 'Ativa',
      updatedAt: serverTimestamp()
    };

    if (!debtId) payload.createdAt = serverTimestamp();

    await setDoc(ref, payload, { merge: true });
  };

  const removeDebt = async (debtId) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/debts/${debtId}`));
  };

  const handlePayInstallment = async (debtId, installmentId, paymentInfo) => {
    if (!user) return;
    await registerInstallmentPayment(user.uid, debtId, installmentId, paymentInfo);
  };

  const updateBudgetSettings = async (newBudget) => {
    if (!user) return;
    const budgetRef = doc(db, `users/${user.uid}/settings/budget`);
    await setDoc(budgetRef, {
      income: Number(newBudget.income) || 0,
      expenses: Number(newBudget.expenses) || 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const saveSimulation = async (simData) => {
    if (!user) return;
    const ref = doc(collection(db, `users/${user.uid}/simulations`));
    await setDoc(ref, {
      ...simData,
      createdAt: serverTimestamp()
    });
  };

  // Métricas Calculadas Globais
  const totalDebt = debts.reduce((acc, d) => acc + (d.remainingAmount || 0), 0);
  const totalPaid = debts.reduce((acc, d) => acc + (d.paidAmount || 0), 0);
  const originalDebtTotal = debts.reduce((acc, d) => acc + (d.originalAmount || 0), 0);
  const monthlyCommitment = debts.reduce((acc, d) => acc + (d.status === 'Ativa' ? (d.installmentAmount || 0) : 0), 0);
  const availableIncome = (budget.income || 0) - (budget.expenses || 0) - monthlyCommitment;

  const metrics = {
    totalDebt,
    totalPaid,
    originalDebtTotal,
    monthlyCommitment,
    debtCount: debts.length,
    availableIncome,
    income: budget.income || 0,
    expenses: budget.expenses || 0
  };

  const value = {
    debts,
    cards,
    budget,
    simulations,
    history,
    metrics,
    loadingData,
    addOrUpdateDebt,
    removeDebt,
    handlePayInstallment,
    updateBudgetSettings,
    saveSimulation
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser utilizado dentro de um FinancialProvider');
  }
  return context;
};