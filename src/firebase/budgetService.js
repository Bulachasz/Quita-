import { db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Salva o orçamento mensal planejado (renda total e metas por categoria).
 */
export async function saveMonthlyBudget(userId, budgetData) {
  const budgetRef = doc(db, `users/${userId}/settings/budget_v2`);

  await setDoc(budgetRef, {
    plannedIncome: Number(budgetData.plannedIncome) || 0,
    categories: budgetData.categories || {},
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Busca o planejamento orçamentário v2 do usuário.
 */
export async function getMonthlyBudget(userId) {
  const budgetRef = doc(db, `users/${userId}/settings/budget_v2`);
  const snap = await getDoc(budgetRef);
  
  if (snap.exists()) {
    return snap.data();
  }

  // Padrão inicial
  return {
    plannedIncome: 0,
    categories: {
      'Alimentação': 0,
      'Casa': 0,
      'Transporte': 0,
      'Saúde': 0,
      'Lazer': 0,
      'Assinaturas': 0,
      'Outros': 0
    }
  };
}