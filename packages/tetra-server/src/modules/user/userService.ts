import { createHash } from 'node:crypto';
import { User, UserDocument } from './userModel';

export async function findByUsername(username: string): Promise<UserDocument | null> {
	return User.findOne({ username });
}

export async function findById(id: string): Promise<UserDocument | null> {
	return User.findById(id);
}

export async function findBySub(sub: string): Promise<UserDocument | null> {
	return User.findOne({ sub });
}

export async function getGravatar(email: string, size: number = 80): Promise<string> {
	const hash = createHash('md5').update(email.trim()).digest('hex');

	return `https://www.gravatar.com/avatar/${hash}.jpg?s=${size}`;
}

export async function create(username: string, email: string, sub: string): Promise<UserDocument> {
	const avatar = await getGravatar(email, 128);
	return await User.create({
		username,
		email,
		avatar,
		sub
	});
}

export async function getOrCreate(username: string, email: string, sub: string): Promise<UserDocument> {
	let user = await findBySub(sub);
	if (!user) {
		user =  await create(username, email, sub);
	}

	return user;
}
