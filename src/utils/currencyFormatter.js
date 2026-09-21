/**
 * Formata um valor numérico para Moeda Brasileira (BRL).
 * Exemplo: 1250.5 -> "R$ 1.250,50"
 */
export function formatBRL(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

/**
 * Formata apenas o número sem o símbolo "R$".
 * Exemplo: 1250.5 -> "1.250,50"
 */
export function formatNumberBR(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

/**
 * Converte string formatada em número float para salvamento.
 * Exemplo: "1.250,50" -> 1250.5
 */
export function parseBRLToNumber(brlString) {
  if (typeof brlString === 'number') return brlString;
  if (!brlString) return 0;
  
  const cleanString = brlString
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  return Number(cleanString) || 0;
}

/**
 * Aplica máscara de moeda em tempo real para campos de formulário.
 */
export function maskCurrencyInput(value) {
  const onlyDigits = String(value).replace(/\D/g, '');
  if (!onlyDigits) return '';
  const cents = Number(onlyDigits) / 100;
  return formatNumberBR(cents);
}