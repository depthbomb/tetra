import { UserRole } from '@tetra/common';
import { model, Schema } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

type IUser = {
	username: string;
	password: string;
	role: string;
	suspended: boolean;
};

export type UserDocument = HydratedDocument<IUser>;

export const User = model<IUser>('User', new Schema<IUser>({
	username: { type: String, unique: true },
	password: String,
	role: { type: String, enum: UserRole, default: UserRole.USER },
	suspended: Boolean,
}));
