/**
 * Formata uma string YYYY-MM-DD, Date ou Timestamp do Firestore para DD/MM/YYYY.
 */
export function formatDateBR(dateInput) {
  if (!dateInput) return '-';

  let date;

  // Se for Timestamp do Firebase
  if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    // Tratar string tipo YYYY-MM-DD sem problema de timezone
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    date = new Date(dateInput);
  } else {
    return '-';
  }

  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Converte Date para formato YYYY-MM-DD aceito por inputs do tipo <input type="date">.
 */
export function toInputDateFormat(date = new Date()) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Verifica se a data fornecida está em atraso em relação ao dia de hoje.
 */
export function isOverdue(dueDateString) {
  if (!dueDateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dueDateString.split('T')[0].split('-');
  if (parts.length !== 3) return false;

  const due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return due < today;
}

/**
 * Retorna o status visual e a cor correspondente para o vencimento.
 */
export function getDueDateStatus(dueDateString, isPaid = false) {
  if (isPaid) {
    return { status: 'Paga', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  }

  if (!dueDateString) {
    return { status: 'Sem data', colorClass: 'text-gray-500 bg-gray-50 border-gray-200' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dueDateString.split('T')[0].split('-');
  const due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'Atrasada', colorClass: 'text-red-600 bg-red-50 border-red-200' };
  }
  if (diffDays <= 5) {
    return { status: `Vence em ${diffDays}d`, colorClass: 'text-amber-600 bg-amber-50 border-amber-200' };
  }
  return { status: 'Futura', colorClass: 'text-slate-600 bg-slate-50 border-slate-200' };
}