/** Validates the format and checksum digit of a Thai 13-digit national ID number. */
export function isValidThaiNationalId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;

  const digits = id.split("").map(Number);
  const sum = digits
    .slice(0, 12)
    .reduce((acc, digit, index) => acc + digit * (13 - index), 0);
  const checkDigit = (11 - (sum % 11)) % 10;

  return checkDigit === digits[12];
}
