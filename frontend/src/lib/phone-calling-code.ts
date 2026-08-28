/**
 * Strips a leading international prefix. Expects a space after the country code
 * (e.g. `+1 555…`, `+44 20…`) so the prefix is unambiguous.
 */
export function stripLeadingCallingCodePrefix(phone: string): string {
  return phone.replace(/^\+\d{1,4}\s+/, "").trim();
}

/**
 * Applies a new country calling code while preserving the local digits the user typed.
 * If `callingCode` is empty, returns `existingPhone` unchanged.
 */
export function mergePhoneWithCallingCode(existingPhone: string, callingCode: string): string {
  const code = callingCode.trim();
  if (!code) return existingPhone;
  const local = stripLeadingCallingCodePrefix(existingPhone);
  return local ? `${code} ${local}` : `${code} `;
}
