export const TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export const ENC_ALGORITHM = 'aes-256-cbc' as const;

export const HELP_COMMANDS = [
  { command: 'masuk [nominal] [ket]', desc: 'Catat pemasukan' },
  { command: '[nomimal] [ket]', desc: 'Catat pengeluaran' },
  { command: '[ket] [nominal]', desc: 'Catat pengeluaran' },
  { command: '.rekap', desc: 'Lihat laporan bulan ini' },
  { command: '.cek | .history | .last [angka]', desc: 'Lihat histori transaksi' },
  { command: '.batal', desc: 'Hapus transaksi terakhir' },
];

export const BUDGET_CATEGORIES_EXPENSE = [
  'Bills',
  'Education',
  'Family Needs',
  'Food & Drinks',
  'Gift and Charity',
  'Groceries',
  'Health & Personal Care',
  'Hobby & Entertainment',
  'Loans',
  'Lending & Receivables',
  'Saving & Investment',
  'Shopping',
  'Sports',
  'Transportation',
  'Traveling',
  'Debt',
  'Other Expense',
] as const;

export const BUDGET_CATEGORIES_INCOME = [
  'Salary',
  'Business & Profit',
  'Freelance & Side Job',
  'Investment & Dividend',
  'Allowance & Gift',
  'Debt Repayment',
  'Bonus & Commission',
  'Rental Income',
  'Refund & Cashback',
  'Other Income',
] as const;

export type IncomeCategory =
  | 'Salary'
  | 'Business & Profit'
  | 'Freelance & Side Job'
  | 'Investment & Dividend'
  | 'Allowance & Gift'
  | 'Debt Repayment'
  | 'Bonus & Commission'
  | 'Rental Income'
  | 'Refund & Cashback'
  | 'Other Income';

export const CATEGORY_EMOJIS_EXPENSE: Record<typeof BUDGET_CATEGORIES_EXPENSE[number], string> = {
  'Bills': '💡',
  'Education': '🎓',
  'Family Needs': '🏠',
  'Food & Drinks': '🍔',
  'Gift and Charity': '🎁',
  'Groceries': '🛒',
  'Health & Personal Care': '🏥',
  'Hobby & Entertainment': '🎮',
  'Loans': '💸',
  'Lending & Receivables': '🤝',
  'Saving & Investment': '📈',
  'Shopping': '🛍️',
  'Sports': '⚽',
  'Transportation': '🚗',
  'Traveling': '✈️',
  'Debt': '💳',
  'Other Expense': '📦',
};

export const CATEGORY_EMOJIS_INCOME: Record<typeof BUDGET_CATEGORIES_INCOME[number], string> = {
  'Salary': '💵',
  'Business & Profit': '📈',
  'Freelance & Side Job': '💻',
  'Investment & Dividend': '📊',
  'Allowance & Gift': '🧧',
  'Debt Repayment': '🤝',
  'Bonus & Commission': '🎉',
  'Rental Income': '🏘️',
  'Refund & Cashback': '💸',
  'Other Income': '📥',
};
