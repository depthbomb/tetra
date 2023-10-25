import { logger } from '@logger';
import { Duration } from '@sapphire/duration';

type Commits = Array<{
	sha: string;
}>;

export class GitHash {
	private static readonly _username = 'depthbomb';
	private static readonly _repo     = 'tetra';

	private static _hash          = '';
	private static _nextRetrieval = new Date();

	private constructor() {}

	public static async retrieve(): Promise<string> {
		const now = new Date();
		const url = `https://api.github.com/repos/${this._username}/${this._repo}/commits`;
		if (now >= this._nextRetrieval) {
			logger.debug('Retrieving latest git hash', { url });

			const res = await fetch(url);
			if (!res.ok) {
				logger.error('Failed to retrieve latest commit hash', { url, error: res.statusText });
			} else {
				const json = await res.json() as Commits;

				this._hash          = json[0].sha.slice(0, 7);
				this._nextRetrieval = new Duration('30 minutes').fromNow;
			}
		}

		return this._hash;
	}
}
