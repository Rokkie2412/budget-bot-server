export type TransactionType = 'OUT' | 'IN';

export type BudgetCategoryExpense =
  | 'Bills'
  | 'Education'
  | 'Family Needs'
  | 'Food & Drinks'
  | 'Gift and Charity'
  | 'Groceries'
  | 'Health & Personal Care'
  | 'Hobby & Entertainment'
  | 'Loans'
  | 'Lending & Receivables'
  | 'Saving & Investment'
  | 'Shopping'
  | 'Sports'
  | 'Transportation'
  | 'Traveling'
  | 'Debt'
  | 'Other Expense';

export type BudgetCategoryIncome =
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

export type BudgetCategory = BudgetCategoryExpense | BudgetCategoryIncome;

/**
 * Row shape of the shared `public.transactions` table used by budget-tracker-pwa.
 * `description` is stored encrypted; `type` is derived from `category`.
 */
export interface TransactionRow {
  transaction_id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

/** Row shape of the shared `public.user_preferences` table. */
export interface UserPreferences {
  premium: boolean;
  allowChat: boolean;
}

/**
 * Result of resolving a WhatsApp number to a linked account.
 * `registered: false` means no account is linked to that phone number.
 */
export type ConnectedAccount =
  | { registered: false }
  | ({ registered: true; userId: string } & UserPreferences);

export interface TotalTransactionRekap {
  outgoing: number;
  incoming: number;
  total: number;
}

export type KeywordMapType = Partial<Record<
  Exclude<BudgetCategory, 'Other Expense' | 'Other Income'>,
  string[]
>>;
