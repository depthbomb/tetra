import { model, Schema } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

type IUser = {
	username: string;
	email: string;
	avatar: string;
	sub: string;
	createdAt: Date;
	updatedAt: Date;
};

export type UserDocument = HydratedDocument<IUser>;

export const User = model<IUser>('User', new Schema<IUser>({
	username: { type: String, unique: true },
	email: { type: String, unique: true },
	avatar: { type: String },
	sub: { type: String, unique: true },
	createdAt: Date,
	updatedAt: Date,
}, { timestamps: true }));
