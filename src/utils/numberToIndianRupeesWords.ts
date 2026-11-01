
/**
 * Converts a numeric amount into Indian Rupees words.
 * Supports the Indian numbering system: Thousand, Lakh, Crore, Arab and Kharab.
 */
const ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
  'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const SCALES = [
  'Thousand',
  'Lakh',
  'Crore',
  'Arab',
  'Kharab',
];

function convertTwoDigits(num: number): string {
  if (num < 20) {
    return ONES[num];
  }

  const tens = Math.floor(num / 10);
  const remainder = num % 10;

  return remainder === 0
    ? TENS[tens]
    : `${TENS[tens]} ${ONES[remainder]}`;
}

function convertThreeDigits(num: number): string {
  if (num < 100) {
    return convertTwoDigits(num);
  }

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  return remainder === 0
    ? `${ONES[hundreds]} Hundred`
    : `${ONES[hundreds]} Hundred ${convertTwoDigits(remainder)}`;
}

function convertIntegerToWords(num: number): string {
  if (!Number.isSafeInteger(num) || num < 0) {
    return '';
  }

  if (num === 0) {
    return 'Zero';
  }

  const parts: string[] = [];

  // Indian grouping starts with the final three digits.
  const lastThree = num % 1000;
  num = Math.floor(num / 1000);

  if (lastThree > 0) {
    parts.unshift(convertThreeDigits(lastThree));
  }

  // All remaining groups contain two digits each.
  let scaleIndex = 0;

  while (num > 0) {
    if (scaleIndex >= SCALES.length) {
      return '';
    }

    const group = num % 100;
    num = Math.floor(num / 100);

    if (group > 0) {
      parts.unshift(
        `${convertTwoDigits(group)} ${SCALES[scaleIndex]}`,
      );
    }

    scaleIndex++;
  }

  return parts.join(' ');
}

/**
 * Converts a numeric amount into Indian Rupees words.
 * @param amount - Integer or decimal amount, optionally as a comma-separated string.
 * @returns Formatted Indian Rupee words.
 */
export function convertNumberToIndianRupeesWords(
  amount: number | string,
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  const normalized =
    typeof amount === 'string' ? amount.replace(/,/g, '').trim() : amount;

  if (normalized === '') {
    return '';
  }

  const numericAmount =
    typeof normalized === 'number' ? normalized : Number(normalized);

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return '';
  }

  // Convert to paise first so decimal values are rounded, not truncated.
  const totalPaise = Math.round(
    (numericAmount + Number.EPSILON) * 100,
  );

  if (!Number.isSafeInteger(totalPaise)) {
    return '';
  }

  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;

  const rupeeWords = convertIntegerToWords(rupees);

  if (!rupeeWords) {
    return '';
  }

  if (paise === 0) {
    return `Rupees ${rupeeWords} Only`;
  }

  const paiseWords = convertTwoDigits(paise);

  return `Rupees ${rupeeWords} and ${paiseWords} Paise Only`;
}
