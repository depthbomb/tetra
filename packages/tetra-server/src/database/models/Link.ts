import { model, Schema }         from 'mongoose';
import type { HydratedDocument } from 'mongoose';

type ILink = {
	creator: string;
	shortcode: string;
	destination: string;
	deletionKey: string;
	disabled: boolean;
	expiresAt: Date;
};

export type LinksDocument = HydratedDocument<ILink>;

export const Links = model<ILink>('Links', new Schema<ILink>({
	creator: String,
	shortcode: { type: String, unique: true },
	destination: String,
	deletionKey: String,
	disabled: Boolean,
	expiresAt: Date
}));
