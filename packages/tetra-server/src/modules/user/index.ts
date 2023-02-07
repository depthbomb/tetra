import { UserRole } from '@tetra/common';
import { User, UserDocument } from '~services/user/userSchema';

export async function findByUsername(username: string): Promise<UserDocument | null> {
	return User.findOne({ username });
}

export async function findById(id: string): Promise<UserDocument | null> {
	return User.findById(id);
}

export async function create(username: string, password: string, role: UserRole = UserRole.USER) {

}
