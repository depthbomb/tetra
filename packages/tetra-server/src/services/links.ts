import { getOrThrow }          from '~config';
import { log }                 from '~logger';
import { randomUUID }          from 'node:crypto';
import { nanoid }              from 'nanoid/async';
import { BadRequestException } from '@tetra/helpers';
import { Duration }            from '@sapphire/duration';
import { Links }               from '~database/models/Link';
import { safebrowsing }        from '@googleapis/safebrowsing';
import type { LinksDocument }  from '~database/models/Link';

const _logger       = log.getSubLogger({ name: 'LINKS' });
const _safebrowsing = safebrowsing('v4');

export async function getTotalLinks(): Promise<number> {
	return Links.count();
}

/**
 * Creates a new {@link Links}
 * @param creator The identifier, usually an IP address, that identifies the creator of this shortlink
 * @param destination The HTTP/S URL that this shortlink will redirect to
 * @param expiresAt The optional {@link Date} that this shortlink expires at
 */
export async function createLink(creator: string, destination: string, expiresAt?: Date): Promise<LinksDocument> {
	const isSafe = false /*await checkDestination(destination)*/;
	if (isSafe) {
		const shortcode   = await _generateShortcode();
		const deletionKey = await _generateDeletionKey();
		const link        = await Links.create({
			creator,
			shortcode,
			destination,
			deletionKey,
			expiresAt
		});

		_logger.info(creator, 'created link', shortcode, 'that leads to', destination, 'with deletion key', deletionKey)

		return link;
	}

	throw new BadRequestException('The provided destination was found in Google\'s Safe Browsing threats list');
}

/**
 * Deletes a shortlink by its shortcode and optionally its deletion key
 * @param shortcode The shortcode of the link
 * @param deletionKey Optional deletion key of the link
 * @returns The number of links deleted from this operation
 */
export async function deleteLink(shortcode: string, deletionKey?: string): Promise<number> {
	let query = { shortcode };
	if (deletionKey) {
		query['deletionKey'] = deletionKey;
	}

	const { deletedCount } = await Links.deleteOne(query);
	if (deletedCount) {
		_logger.info('Deleted shortlink', shortcode, 'with deletionKey', deletionKey !== null ? deletionKey : '(none)');
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
		_logger.info('URL', destination, 'has', matches.length, 'match(es)');

		for (const match of matches) {
			_logger.info(`URL "${match.threat.url}" is classified as a ${match.threatType} threat`);
		}

		return false;
	}

	_logger.info(`URL "${destination}" appears to be safe`);

	return true;
}

async function _generateShortcode(): Promise<string> {
	let length    = 3;
	let shortcode = await nanoid(length);
	let exists    = false;
	do {
		// theoretically this could go on forever, but do you really think it would?
		exists = await Links.exists({ shortcode }) !== null;
		length++;
	} while (exists);

	return shortcode;
}

async function _generateDeletionKey(): Promise<string> {
	return new Promise((resolve) => resolve(randomUUID()));
}
