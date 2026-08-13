// מספרים בלבד, עם רווחים/מקפים מותרים לפורמט (לדוגמה "052-1234567") — לא אותיות.
// טלפון הוא שדה אופציונלי, אז מחרוזת ריקה תמיד תקינה.
const PHONE_PATTERN = /^[0-9\s-]+$/;

export function isValidPhone(phone) {
  const trimmed = phone?.trim() ?? '';
  if (!trimmed) return true;
  return PHONE_PATTERN.test(trimmed);
}
