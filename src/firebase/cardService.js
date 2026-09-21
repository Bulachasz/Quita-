import { db } from './config';
import { doc, collection, runTransaction, serverTimestamp, getDocs } from 'firebase/firestore';

/**
 * Busca todos os cartões de crédito do usuário.
 */
export async function getUserCards(userId) {
  const cardsCol = collection(db, `users/${userId}/cards`);
  const snap = await getDocs(cardsCol);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Cadastra um novo cartão de crédito.
 */
export async function createCreditCard(userId, cardData) {
  const cardRef = doc(collection(db, `users/${userId}/cards`));
  const limit = Number(cardData.limit) || 0;

  await runTransaction(db, async (transaction) => {
    transaction.set(cardRef, {
      name: cardData.name,
      institution: cardData.institution || 'Outro',
      limit: limit,
      availableLimit: limit,
      currentInvoice: 0,
      closingDay: Number(cardData.closingDay) || 1,
      dueDay: Number(cardData.dueDay) || 10,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  return cardRef.id;
}

/**
 * Registra uma compra no cartão (à vista ou parcelada em até N vezes).
 */
export async function addCardPurchase(userId, cardId, purchaseData) {
  const cardRef = doc(db, `users/${userId}/cards/${cardId}`);
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const cardSnap = await transaction.get(cardRef);
    if (!cardSnap.exists()) throw new Error("Cartão de crédito não encontrado.");

    const card = cardSnap.data();
    const totalAmount = Number(purchaseData.amount) || 0;
    const installmentsCount = Math.max(1, Number(purchaseData.installments) || 1);
    const installmentAmount = totalAmount / installmentsCount;

    if (totalAmount > (card.availableLimit || 0)) {
      throw new Error("Limite disponível insuficiente no cartão.");
    }

    const newAvailableLimit = (card.availableLimit || 0) - totalAmount;
    const newCurrentInvoice = (card.currentInvoice || 0) + (installmentsCount === 1 ? totalAmount : installmentAmount);

    // 1. Atualizar limite e fatura do cartão
    transaction.update(cardRef, {
      availableLimit: newAvailableLimit,
      currentInvoice: newCurrentInvoice,
      updatedAt: serverTimestamp()
    });

    // 2. Registrar parcelas nas transações do cartão
    const purchaseRef = doc(collection(db, `users/${userId}/cards/${cardId}/transactions`));
    transaction.set(purchaseRef, {
      description: purchaseData.description,
      category: purchaseData.category || 'Outros',
      totalAmount,
      installmentsCount,
      installmentAmount,
      purchaseDate: purchaseData.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    // 3. Registrar Histórico
    transaction.set(historyRef, {
      action: 'COMPRA_CARTAO',
      description: `Compra: ${purchaseData.description} (${installmentsCount}x de R$ ${installmentAmount.toFixed(2)}) no cartão ${card.name}`,
      amount: -totalAmount,
      date: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * Paga a fatura do cartão de crédito debitando de uma conta bancária e liberando limite.
 */
export async function payCardInvoice(userId, cardId, accountId, paymentAmount) {
  const cardRef = doc(db, `users/${userId}/cards/${cardId}`);
  const accountRef = doc(db, `users/${userId}/accounts/${accountId}`);
  const historyRef = doc(collection(db, `users/${userId}/history`));

  return await runTransaction(db, async (transaction) => {
    const cardSnap = await transaction.get(cardRef);
    const accountSnap = await transaction.get(accountRef);

    if (!cardSnap.exists() || !accountSnap.exists()) {
      throw new Error("Cartão de crédito ou conta bancária não encontrados.");
    }

    const card = cardSnap.data();
    const account = accountSnap.data();
    const amount = Number(paymentAmount) || 0;

    if (amount <= 0) throw new Error("Valor de pagamento inválido.");

    // Atualizar conta bancária
    const newAccountBalance = (account.currentBalance || 0) - amount;
    transaction.update(accountRef, {
      currentBalance: newAccountBalance,
      updatedAt: serverTimestamp()
    });

    // Liberar limite do cartão e abater fatura
    const newCurrentInvoice = Math.max(0, (card.currentInvoice || 0) - amount);
    const newAvailableLimit = Math.min(card.limit, (card.availableLimit || 0) + amount);

    transaction.update(cardRef, {
      currentInvoice: newCurrentInvoice,
      availableLimit: newAvailableLimit,
      updatedAt: serverTimestamp()
    });

    // Registrar no histórico
    transaction.set(historyRef, {
      action: 'PAGAMENTO_FATURA',
      description: `Pagamento de fatura: R$ ${amount.toFixed(2)} do cartão ${card.name} pago via ${account.name}`,
      amount: -amount,
      date: serverTimestamp()
    });

    return { success: true };
  });
}