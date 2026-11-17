/**
 * Strip HTML tags & XSS patterns dari input teks.
 * Dipakai di Server Actions sebelum data masuk ke DB.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Filter input teks di sisi client:
 * - Strip emoji & karakter unicode non-standar
 * - Strip karakter kontrol
 * - Izinkan: huruf (latin + diakritik), angka, spasi, dan tanda baca umum
 * Dipakai di onChange semua input teks nama / alamat / catatan.
 */
export function filterTextInput(value: string): string {
  return value
    // Strip emoji dan simbol unicode (blok Emoticons, Misc Symbols, Supplemental, dll.)
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
    // Strip karakter kontrol (tab, newline diizinkan; U+0000–U+0008, U+000B–U+001F, U+007F–U+009F)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // Strip karakter surrogate pair sisa
    .replace(/[\uD800-\uDFFF]/g, "");
}

/**
 * Blokir penekanan tombol yang tidak wajar untuk input angka bulat positif.
 * Gunakan di onKeyDown input type="number".
 * Mencegah: e, E, +, -, .
 */
export function blockNonInteger(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (["e", "E", "+", "-", "."].includes(e.key)) {
    e.preventDefault();
  }
}
