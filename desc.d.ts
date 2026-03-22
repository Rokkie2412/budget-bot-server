declare module 'qrcode-terminal' {
  export interface GenerateOptions {
    small?: boolean;
  }

  /**
   * Menghasilkan QR Code di terminal.
   * @param text Teks atau URL yang ingin dijadikan QR Code.
   * @param options Opsi konfigurasi seperti ukuran kecil (small).
   */
  export function generate(text: string, options?: GenerateOptions): void;

  /**
   * Versi dari library.
   */
  export const version: string;
}