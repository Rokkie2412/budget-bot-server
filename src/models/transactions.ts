import mongoose from "mongoose";

import { BUDGET_CATEGORIES } from "../constants";
import type { ITransaction } from '../types';

const TransactionSchema = new mongoose.Schema<ITransaction>({
	userId: { type: String, required: true },
	amount: { type: Number, required: true },
	description: { type: String, required: true },
	date: { type: Date, default: Date.now },
	type: { type: String, required: true },
	category: { type: String, enum: BUDGET_CATEGORIES, default: 'Other' }
}, {
	collection: 'transaction-list',
	versionKey: false
});

const Transaction: mongoose.Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
