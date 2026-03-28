export const TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT'
} as const

export const ENC_ALGORITHM = 'aes-256-cbc' as const;

export const HELP_COMMANDS = [
  { command: 'masuk [nominal] [ket]', desc: 'Catat pemasukan' },
  { command: '[nomimal] [ket]', desc: 'Catat pengeluaran' },
  { command: '[ket] [nominal]', desc: 'Catat pengeluaran' },
  { command: '.rekap', desc: 'Lihat laporan bulan ini' },
  { command: '.cek | .history | .last [angka]', desc: 'Lihat histori transaksi' },
  // { command: '.batal', desc: 'Hapus transaksi terakhir' },
];