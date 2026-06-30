interface ParsedReceipt {
  merchant: string | null;
  total: number | null;
  date: string | null;
}

/**
 * Parsing rule-based dari raw text hasil OCR struk Indonesia.
 * Karena tanpa AI, hasil ini perlu selalu direview manual oleh user.
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    merchant: extractMerchant(lines),
    total: extractTotal(lines),
    date: extractDate(rawText),
  };
}

function extractMerchant(lines: string[]): string | null {
  // Heuristik: baris pertama yang cukup panjang & bukan angka/simbol semata
  for (const line of lines.slice(0, 3)) {
    if (line.length > 3 && /[a-zA-Z]/.test(line)) {
      return line;
    }
  }
  return null;
}

function extractTotal(lines: string[]): number | null {
  const totalKeywords = /total|jumlah|grand total|total bayar/i;
  const numberPattern = /([\d.,]+)\s*$/;

  let bestMatch: number | null = null;

  for (const line of lines) {
    if (totalKeywords.test(line)) {
      const match = line.match(numberPattern);
      if (match) {
        const parsed = parseIndonesianNumber(match[1]);
        if (parsed && (bestMatch === null || parsed > bestMatch)) {
          bestMatch = parsed;
        }
      }
    }
  }

  return bestMatch;
}

function parseIndonesianNumber(raw: string): number | null {
  let cleaned = raw.replace(/[^\d.,]/g, "");
  // Jika diakhiri koma atau titik diikuti 1 atau 2 digit (sen/desimal), hapus bagian desimal tersebut
  const decimalMatch = cleaned.match(/[,.](\d{1,2})$/);
  if (decimalMatch) {
    cleaned = cleaned.substring(0, cleaned.length - decimalMatch[0].length);
  }
  // Hapus semua pemisah ribuan (titik atau koma) yang tersisa
  const normalized = cleaned.replace(/[.,]/g, "");
  const num = parseInt(normalized, 10);
  return isNaN(num) ? null : num;
}

function extractDate(rawText: string): string | null {
  // Pola umum: dd/mm/yyyy, dd-mm-yyyy, dd/mm/yy
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const match = rawText.match(datePattern);

  if (!match) return null;

  const [, day, month, rawYear] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;

  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  return isNaN(date.getTime()) ? null : date.toISOString();
}
