import mongoose from 'mongoose';

import type { IUserConnected } from '../types';

const UserConnectedSchema = new mongoose.Schema<IUserConnected>(
	{
		userId: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true
		}
	},
	{
		strict: false,
		collection: 'user-connected'
	}
);

export default mongoose.model('UserConnected', UserConnectedSchema, 'user-connected');