import mongoose from "mongoose";

import type { ITransaction } from '../../types';

const TransactionSchema = new mongoose.Schema<ITransaction>({
	userId: { type: String, required: true },
	amount: { type: Number, required: true },
	description: { type: String, required: true },
	date: { type: Date, default: Date.now }
});

export default mongoose.model("Transaction", TransactionSchema, 'transaction-list');
