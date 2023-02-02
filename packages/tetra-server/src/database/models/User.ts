import { model, Schema } from 'mongoose';
import { UserRole }      from '~common/UserRole';

type IUser = {
	username: string;
	password: string;
	role: string;
	suspended: boolean;
};

export const User = model<IUser>('User', new Schema<IUser>({
	username: { type: String, unique: true },
	password: String,
	role: { type: String, enum: UserRole, default: UserRole.USER },
	suspended: Boolean,
}));
