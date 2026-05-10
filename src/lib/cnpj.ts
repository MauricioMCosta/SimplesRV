export function fromText(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function toText(cnpj: string): string {
  const digits = fromText(cnpj);
  if (digits.length !== 14) return digits;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function isValidCNPJ(cnpj: string): boolean {
  const digits = fromText(cnpj);

  if (digits.length !== 14) return false;

  // Check for common invalid sequences (all same digits)
  if (/^(\d)\1+$/.test(digits)) return false;

  const calculateDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split('')
      .reduce((acc, digit, idx) => acc + parseInt(digit) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digit1 = calculateDigit(digits.slice(0, 12), weights1);
  const digit2 = calculateDigit(digits.slice(0, 13), weights2);

  return (
    digit1 === parseInt(digits[12]) && digit2 === parseInt(digits[13])
  );
}
