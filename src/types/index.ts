export interface IUserConnected {
  userId: string;
  password: string;
}

export type BudgetCategoryExpense =
  | "Bills"
  | "Education"
  | "Family Needs"
  | "Food & Drinks"
  | "Gift and Charity"
  | "Groceries"
  | "Health & Personal Care"
  | "Hobby & Entertainment"
  | "Loans"
  | "Lending & Receivables"
  | "Saving & Investment"
  | "Shopping"
  | "Sports"
  | "Transportation"
  | "Traveling"
  | "Debt"
  | "Other Expense";

export type BudgetCategoryIncome =
  | "Salary"
  | "Business & Profit"
  | "Freelance & Side Job"
  | "Investment & Dividend"
  | "Allowance & Gift"
  | "Debt Repayment"
  | "Bonus & Commission"
  | "Rental Income"
  | "Refund & Cashback"
  | "Other Income";

export interface ITransaction {
  userId: string;
  amount: number;
  description: string;
  date: Date;
  type: "OUT" | "IN";
  category?: BudgetCategoryExpense | BudgetCategoryIncome;
}

export interface Rekap {
  _id: "OUT" | "IN";
  total: number;
  count: number;
}

export interface TotalTransactionRekap {
  outgoing: number;
  incoming: number;
  total: number;
}

export type KeywordMapType = Partial<Record<
  Exclude<BudgetCategoryExpense | BudgetCategoryIncome, "Other Expense" | "Other Income">,
  string[]
>>;