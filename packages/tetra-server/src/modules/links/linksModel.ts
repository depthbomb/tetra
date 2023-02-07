import { model, Schema } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

type ILink = {
	creator: string;
	shortcode: string;
	destination: string;
	deletionKey: string;
	disabled: boolean;
	expiresAt: Date;
};

export type LinkDocument = HydratedDocument<ILink>;

export const Link = model<ILink>('Link', new Schema<ILink>({
	creator: String,
	shortcode: { type: String, unique: true },
	destination: String,
	deletionKey: String,
	disabled: Boolean,
	expiresAt: Date
}));
