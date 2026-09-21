import { db } from "./config";
import { 
  collection, 
  doc, 
  runTransaction, 
  writeBatch,
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";

/**
 * Registra o pagamento de uma parcela atualizando a dívida e o histórico atomicamente.
 */
export async function registerInstallmentPayment(userId, debtId, installmentId, paymentData) {
  const debtRef = doc(db, `users/${userId}/debts/${debtId}`);
  const installmentRef = doc(db, `users/${userId}/debts/${debtId}/installments/${installmentId}`);
  const paymentRef = doc(collection(db, `users/${userId}/payments`));
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const debtSnap = await transaction.get(debtRef);
    const instSnap = await transaction.get(installmentRef);

    if (!debtSnap.exists()) {
      throw new Error("Dívida não encontrada.");
    }

    const debt = debtSnap.data();
    const inst = instSnap.exists() ? instSnap.data() : null;

    const paidAmount = Number(paymentData.amount) || (inst ? inst.amount : debt.installmentAmount);
    const newPaidInstallments = debt.paidInstallments + 1;
    const newRemainingInstallments = Math.max(0, debt.totalInstallments - newPaidInstallments);
    const newPaidAmount = (debt.paidAmount || 0) + paidAmount;
    const newRemainingAmount = Math.max(0, (debt.remainingAmount || 0) - paidAmount);
    const newStatus = newRemainingInstallments === 0 ? "Quitada" : "Ativa";

    // 1. Se a parcela existir, atualizar status
    if (instSnap.exists()) {
      transaction.update(installmentRef, {
        status: "Paga",
        paidDate: paymentData.paidDate || new Date().toISOString(),
        paidAmount: paidAmount,
        updatedAt: serverTimestamp()
      });
    }

    // 2. Atualizar a dívida principal
    transaction.update(debtRef, {
      paidInstallments: newPaidInstallments,
      remainingInstallments: newRemainingInstallments,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    // 3. Criar registro de pagamento
    transaction.set(paymentRef, {
      debtId,
      installmentId: installmentId || null,
      amount: paidAmount,
      paymentMethod: paymentData.paymentMethod || "Pix",
      paymentDate: paymentData.paidDate || new Date().toISOString(),
      notes: paymentData.notes || "",
      createdAt: serverTimestamp()
    });

    // 4. Registrar evento no histórico
    transaction.set(historyRef, {
      action: "PAGAMENTO_PARCELA",
      description: `Pagamento de R$ ${paidAmount.toFixed(2)} registrado para ${debt.name}`,
      amount: paidAmount,
      date: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * Cria individualmente todas as parcelas de uma dívida recém-criada usando WriteBatch.
 */
export async function generateDebtInstallments(userId, debtId, debtData) {
  const batch = writeBatch(db);
  const total = Number(debtData.totalInstallments) || 1;
  const installmentValue = Number(debtData.installmentAmount) || 0;
  const paidCount = Number(debtData.paidInstallments) || 0;
  const startDate = debtData.dueDate ? new Date(debtData.dueDate) : new Date();

  for (let i = 1; i <= total; i++) {
    const instRef = doc(collection(db, `users/${userId}/debts/${debtId}/installments`));
    const isPaid = i <= paidCount;
    
    // Calcular vencimento para meses subsequentes
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    batch.set(instRef, {
      installmentNumber: i,
      amount: installmentValue,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: isPaid ? new Date().toISOString().split('T')[0] : null,
      paidAmount: isPaid ? installmentValue : 0,
      status: isPaid ? "Paga" : "Pendente",
      createdAt: serverTimestamp()
    });
  }

  await batch.commit();
}

/**
 * Exclui permanentemente todos os dados de um usuário (em conformidade com a LGPD e regras de privacidade).
 */
export async function deleteAllUserData(userId) {
  const collectionsToClean = ['debts', 'cards', 'payments', 'simulations', 'expenses', 'income', 'history'];

  for (const colName of collectionsToClean) {
    const colRef = collection(db, `users/${userId}/${colName}`);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

  // Deletar documento raiz do usuário
  const userRef = doc(db, `users/${userId}`);
  const batch = writeBatch(db);
  batch.delete(userRef);
  await batch.commit();
}