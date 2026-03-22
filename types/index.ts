export interface IUserConnected {
  userId: string;
}

export interface ITransaction {
  userId: string;
  amount: number;
  description: string;
  date: Date;
}