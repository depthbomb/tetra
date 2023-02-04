import { model, Schema } from 'mongoose';
import { UserRole } from '@tetra/common';
import type { HydratedDocument } from 'mongoose';

type IUser = {
	username: string;
	password: string;
	role: string;
	suspended: boolean;
};

export type UsersDocument = HydratedDocument<IUser>;

export const Users = model<IUser>('Users', new Schema<IUser>({
	username: { type: String, unique: true },
	password: String,
	role: { type: String, enum: UserRole, default: UserRole.USER },
	suspended: Boolean,
}));
