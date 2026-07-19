export interface IUserConnected {
  userId: string;
  password: string;
}

export type BudgetCategory =
  | "Bills"
  | "Education"
  | "Family Needs"
  | "Food & Drinks"
  | "Gift and Chartiy"
  | "Groceries"
  | "Health & personal care"
  | "Hobby & Entertaiment"
  | "Loans"
  | "Saving & Investment"
  | "Shopping"
  | "sports"
  | "Transportaion"
  | "Traveling"
  | "Other";

export interface ITransaction {
  userId: string;
  amount: number;
  description: string;
  date: Date;
  type: "OUT" | "IN";
  category?: BudgetCategory;
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