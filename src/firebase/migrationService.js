import { db } from './config';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

/**
 * Garante a estrutura do V2 no Firestore para o usuário sem afetar dados legados.
 */
export async function ensureV2UserDataStructure(userId) {
  if (!userId) return;

  const userRef = doc(db, `users/${userId}`);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      v2Migrated: true
    }, { merge: true });
  }

  // Garantir que exista ao menos uma Conta Principal para movimentações
  const accountsCol = collection(db, `users/${userId}/accounts`);
  const accountsSnap = await getDocs(accountsCol);

  if (accountsSnap.empty) {
    const defaultAccountRef = doc(accountsCol, 'main_account');
    await setDoc(defaultAccountRef, {
      name: 'Conta Principal',
      institution: 'Carteira / Banco Principal',
      type: 'Conta Corrente',
      initialBalance: 0,
      currentBalance: 0,
      isDefault: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  await setDoc(userRef, { v2Migrated: true, lastSchemaCheck: serverTimestamp() }, { merge: true });
}