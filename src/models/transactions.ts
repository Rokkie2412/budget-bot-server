import mongoose from "mongoose";

import {
	BUDGET_CATEGORIES_EXPENSE,
	BUDGET_CATEGORIES_INCOME,
	TRANSACTION_TYPE,
} from "../constants/index.js";
import type { ITransaction } from '../types/index.js';

const TransactionSchema = new mongoose.Schema<ITransaction>({
	userId: { type: String, required: true },
	amount: { type: Number, required: true },
	description: { type: String, required: true },
	date: { type: Date, default: Date.now },
	type: { type: String, enum: Object.values(TRANSACTION_TYPE), required: true },
	category: {
		type: String,
		enum: [...BUDGET_CATEGORIES_EXPENSE, ...BUDGET_CATEGORIES_INCOME],
		default: function (this: { type?: ITransaction['type'] }) {
			return this.type === TRANSACTION_TYPE.IN ? 'Other Income' : 'Other Expense';
		},
		validate: {
			validator: function (this: { type?: ITransaction['type'] }, category: string) {
				const categories = this.type === TRANSACTION_TYPE.IN
					? BUDGET_CATEGORIES_INCOME
					: BUDGET_CATEGORIES_EXPENSE;
				return (categories as readonly string[]).includes(category);
			},
			message: 'Category does not match transaction type',
		},
	}
}, {
	collection: 'transaction-list',
	versionKey: false
});

const Transaction: mongoose.Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
