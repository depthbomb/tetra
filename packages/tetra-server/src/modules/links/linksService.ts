import { log } from '~logger';
import { Link } from './linksModel';
import { getOrThrow } from '~config';
import { nanoid } from 'nanoid/async';
import { randomUUID } from 'node:crypto';
import { Duration } from '@sapphire/duration';
import { UnsafeUrlException } from './linksExceptions';
import { safebrowsing } from '@googleapis/safebrowsing';
import type { LinkDocument } from './linksModel';
import type { ILinkRedirectionInfo } from '@tetra/common';

const _logger       = log.getSubLogger({ name: 'LINKS' });
const _safebrowsing = safebrowsing('v4');

/**
 * Returns the total number of links on record
 */
export async function getTotalLinks(): Promise<number> {
	return Link.count();
}

export async function getLinksByCreator(creator: string): Promise<LinkDocument[]> {
	return Link.where({ creator });
}

/**
 * Gets basic info on a link required to perform a redirection
 * @param shortcode The shortcode of the link to retrieve redirection info on
 * @returns An object containing the link destination and its expiration date (if applicable), `null` otherwise
 */
export async function getRedirectionInfo(shortcode: string): Promise<ILinkRedirectionInfo | null> {
	const link = await Link.findOne({ shortcode });
	if (link) {
		const { destination, expiresAt } = link;
		return { destination, expiresAt };
	}

	return null;
}

/**
 * Creates a new {@link Links}
 * @param creator The identifier, usually an IP address, that identifies the creator of this shortlink
 * @param destination The HTTP/S URL that this shortlink will redirect to
 * @param expiresAt The optional {@link Date} that this shortlink expires at
 */
export async function createLink(creator: string, destination: string, expiresAt?: Date): Promise<LinkDocument> {
	const isSafe = await checkDestination(destination);

	UnsafeUrlException.assert(isSafe);

	const shortcode   = await _generateShortcode();
	const deletionKey = await _generateDeletionKey();
	const link        = await Link.create({
		creator,
		shortcode,
		destination,
		deletionKey,
		expiresAt
	});

	_logger.info(`${creator} created link "${shortcode}" that leads to "${destination}" with deletion key "${deletionKey}"`)

	return link;
}

/**
 * Deletes a shortlink by its shortcode and optionally its deletion key
 * @param shortcode The shortcode of the link
 * @param deletionKey Optional deletion key of the link
 * @returns The number of links deleted from this operation
 */
export async function deleteLink(shortcode: string, deletionKey?: string): Promise<number> {
	try {
		const { deletedCount } = await Link.deleteOne({ shortcode, deletionKey });
		if (deletedCount) {
			_logger.info(`Deleted shortlink "${shortcode}" with deletionKey "${deletionKey !== null ? deletionKey : '<none>'}"`);
		}

		return deletedCount;
	} catch (err: unknown) {
		_logger.error(`Failed to delete link with shortcode "${shortcode}" and deletion key "${deletionKey}"`);
		_logger.error(err);

		throw err;
	}
}

export async function deleteExpiredLinks(): Promise<number> {
	const now = new Date();
	const { deletedCount } = await Link.deleteMany({ expiresAt: { $lte: now } });
	if (deletedCount > 0) {
		_logger.info(`Deleted ${deletedCount} expired link(s)`);
	} else {
		_logger.debug('No links to expire');
	}

	return deletedCount;
}

/**
 * Determines if a duration string is valid
 * @param input The input duration string
 * @returns `true` if the input duration string is valid, `false` otherwise
 *
 * @see https://github.com/sapphiredev/utilities/tree/main/packages/duration#readme
 */
export async function isDurationValid(input: string): Promise<boolean> {
	try {
		return !Number.isNaN(new Duration(input).offset);
	} catch {
		return false;
	}
}

/**
 * Uses Google's Safe Browsing service to check if a URL is considered safe
 * @param destination The destination URL to check
 * @returns `true` if the {@link destination} URL is marked as a threat according to Google's Safe Browsing service
 */
export async function checkDestination(destination: string): Promise<boolean> {
	const { data } = await _safebrowsing.threatMatches.find({
		auth: getOrThrow<string>('apiKeys.safebrowsing'),
		requestBody: {
			threatInfo: {
				threatEntryTypes: ['URL'],
				threatEntries: [
					{ url: destination }
				]
			}
		}
	});

	const { matches } = data;
	if (matches && matches.length) {
		_logger.info(`URL "${destination}" has ${matches.length} match(es)`);

		for (const match of matches) {
			_logger.info(`URL "${match.threat.url}" is classified as a "${match.threatType}" threat`);
		}

		return false;
	}

	_logger.info(`URL "${destination}" appears to be safe`);

	return true;
}

async function _generateShortcode(): Promise<string> {
	let length    = 3;
	let shortcode = await nanoid(length);
	do {
		// theoretically this could go on forever, but do you really think it would?
		const exists = await Link.exists({ shortcode }) !== null;
		if (!exists) break;

		length++;
		shortcode = await nanoid(length);
	// eslint-disable-next-line no-constant-condition
	} while (true);

	return shortcode;
}

async function _generateDeletionKey(): Promise<string> {
	return new Promise((resolve) => resolve(randomUUID()));
}
