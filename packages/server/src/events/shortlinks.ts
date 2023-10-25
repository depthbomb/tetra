import mitt from 'mitt';
import { database } from '@database';

/**
 * Creates an event emitter related to shortlink counts.
 */
export const counterEvent = mitt<{ shortlinkCount: number; }>();

/**
 * Emits the current shortlink count to all `shortlinkCount` listeners.
 */
export async function emitShortlinkCount(): Promise<void> {
	const count = await database.shortlink.count({
		where: {
			disabled: false
		}
	});

	counterEvent.emit('shortlinkCount', count);
}
