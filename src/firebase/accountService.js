import { db } from './config';
import { doc, collection, runTransaction, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Busca todas as contas bancárias do usuário.
 */
export async function getUserAccounts(userId) {
  const accountsCol = collection(db, `users/${userId}/accounts`);
  const snap = await getDocs(accountsCol);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Cadastra uma nova conta bancária (ex: Nubank, Itaú, Carteira).
 */
export async function createAccount(userId, accountData) {
  const accountRef = doc(collection(db, `users/${userId}/accounts`));
  const initialBalance = Number(accountData.initialBalance) || 0;

  await runTransaction(db, async (transaction) => {
    transaction.set(accountRef, {
      name: accountData.name,
      institution: accountData.institution || 'Outro',
      type: accountData.type || 'Conta Corrente',
      initialBalance: initialBalance,
      currentBalance: initialBalance,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  return accountRef.id;
}

/**
 * Adiciona uma Receita e atualiza o saldo da conta atomicamente.
 */
export async function addIncomeTransaction(userId, incomeData) {
  const accountRef = doc(db, `users/${userId}/accounts/${incomeData.accountId}`);
  const incomeRef = doc(collection(db, `users/${userId}/income`));
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const accountSnap = await transaction.get(accountRef);
    if (!accountSnap.exists()) throw new Error("Conta bancária não encontrada.");

    const account = accountSnap.data();
    const amount = Number(incomeData.amount) || 0;
    const newBalance = (account.currentBalance || 0) + amount;

    // 1. Atualizar Saldo da Conta
    transaction.update(accountRef, {
      currentBalance: newBalance,
      updatedAt: serverTimestamp()
    });

    // 2. Registar Receita
    transaction.set(incomeRef, {
      description: incomeData.description,
      category: incomeData.category || 'Salário',
      amount: amount,
      accountId: incomeData.accountId,
      date: incomeData.date || new Date().toISOString().split('T')[0],
      recurrence: incomeData.recurrence || 'única',
      notes: incomeData.notes || '',
      createdAt: serverTimestamp()
    });

    // 3. Registrar no Histórico
    transaction.set(historyRef, {
      action: 'RECEITA_ADICIONADA',
      description: `Receita: ${incomeData.description} (+ R$ ${amount.toFixed(2)}) em ${account.name}`,
      amount: amount,
      date: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * Adiciona uma Despesa e subtrai o valor da conta atomicamente.
 */
export async function addExpenseTransaction(userId, expenseData) {
  const accountRef = doc(db, `users/${userId}/accounts/${expenseData.accountId}`);
  const expenseRef = doc(collection(db, `users/${userId}/expenses`));
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const accountSnap = await transaction.get(accountRef);
    if (!accountSnap.exists()) throw new Error("Conta bancária não encontrada.");

    const account = accountSnap.data();
    const amount = Number(expenseData.amount) || 0;
    const newBalance = (account.currentBalance || 0) - amount;

    // 1. Atualizar Saldo da Conta
    transaction.update(accountRef, {
      currentBalance: newBalance,
      updatedAt: serverTimestamp()
    });

    // 2. Registrar Despesa
    transaction.set(expenseRef, {
      description: expenseData.description,
      category: expenseData.category || 'Outros',
      subCategory: expenseData.subCategory || '',
      amount: amount,
      accountId: expenseData.accountId,
      paymentMethod: expenseData.paymentMethod || 'Débito/Pix',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      recurrence: expenseData.recurrence || 'única',
      notes: expenseData.notes || '',
      createdAt: serverTimestamp()
    });

    // 3. Registrar no Histórico
    transaction.set(historyRef, {
      action: 'DESPESA_ADICIONADA',
      description: `Despesa: ${expenseData.description} (- R$ ${amount.toFixed(2)}) de ${account.name}`,
      amount: -amount,
      date: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * Transferência entre contas (sem afetar receitas/despesas).
 */
export async function transferBetweenAccounts(userId, originAccountId, destAccountId, amount, description = '') {
  const originRef = doc(db, `users/${userId}/accounts/${originAccountId}`);
  const destRef = doc(db, `users/${userId}/accounts/${destAccountId}`);
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const originSnap = await transaction.get(originRef);
    const destSnap = await transaction.get(destRef);

    if (!originSnap.exists() || !destSnap.exists()) {
      throw new Error("Uma das contas bancárias não foi encontrada.");
    }

    const origin = originSnap.data();
    const dest = destSnap.data();
    const val = Number(amount) || 0;

    if (val <= 0) throw new Error("Valor de transferência inválido.");

    transaction.update(originRef, {
      currentBalance: (origin.currentBalance || 0) - val,
      updatedAt: serverTimestamp()
    });

    transaction.update(destRef, {
      currentBalance: (dest.currentBalance || 0) + val,
      updatedAt: serverTimestamp()
    });

    transaction.set(historyRef, {
      action: 'TRANSFERENCIA_CONTAS',
      description: `Transferência de R$ ${val.toFixed(2)} de ${origin.name} para ${dest.name}. ${description}`,
      amount: val,
      date: serverTimestamp()
    });

    return { success: true };
  });
}