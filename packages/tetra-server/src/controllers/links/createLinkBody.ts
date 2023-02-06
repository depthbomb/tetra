import { z } from 'zod';
import { Duration } from '@sapphire/duration';

const destination = z.string().url({
	message: 'Invalid destination URL'
});

const duration = z.custom<string>((val) => new Duration(val as string).offset >= 60_000, {
	message: 'Duration is invalid or too short'
}).optional();

const expiresAt = z.string().datetime().optional();

export const CreateLinkBody = z.object({ destination, duration, expiresAt });
