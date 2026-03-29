export interface IUserConnected {
  userId: string;
}

export interface ITransaction {
  userId: string;
  amount: number;
  description: string;
  date: Date;
  type: "OUT" | "IN";
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