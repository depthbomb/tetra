import ms                                          from 'ms';
import { Model }                                   from 'mongoose';
import { randomUUID }                              from 'node:crypto';
import { nanoid }                                  from 'nanoid/async';
import { ConfigService }                           from '@nestjs/config';
import { Logger, Injectable, BadRequestException } from '@nestjs/common';
import { Cron }                                    from '@nestjs/schedule';
import { InjectModel }                             from '@nestjs/mongoose';
import { safebrowsing }                            from '@googleapis/safebrowsing';
import { Link, LinksDocument }                     from '~modules/links/links.schema';
import type { StringValue }                        from 'ms';
import type { ILinkRedirectionInfo }               from '~modules/links/interfaces/ILinkRedirectionInfo';

@Injectable()
export class LinksService {
    private readonly _logger = new Logger(LinksService.name);
    private readonly _safebrowsing = safebrowsing('v4');

    public constructor(
        private readonly _config: ConfigService,
        @InjectModel(Link.name) private readonly _links: Model<LinksDocument>
    ) {}

    public async getRedirectionInfo(shortcode: string): Promise<ILinkRedirectionInfo|null> {
        const link = await this._links.findOne({ shortcode });
        if (link) {
            const { destination, expiresAt } = link;
            return { destination, expiresAt };
        }

        return null;
    }

    public async createLink(creator: string, destination: string, expiresAt?: Date): Promise<Link> {
        const isDestinationSafe = await this.isDestinationSafe(destination);
        if  (isDestinationSafe) {
            const shortcode   = await this._generateShortcode();
            const deletionKey = await this._generateDeletionKey();
            return await this._links.create({
                creator,
                shortcode,
                destination,
                deletionKey,
                expiresAt
            });
        }

        throw new BadRequestException('The provided destination was found in Google\'s Safe Browsing threats list');
    }

    public async deleteLink(shortcode: string, deletionKey?: string): Promise<number> {
        let query = { shortcode };
        if (deletionKey) {
            query['deletionKey'] = deletionKey;
        }

        const { deletedCount } = await this._links.deleteOne(query);
        if (deletedCount) {
            this._logger.log(deletionKey !== null ?
                `Deleted shortlink "${shortcode}" with deletionKey "${deletionKey}"` :
                `Deleted shortlink "${shortcode}`
            );
        }

        return deletedCount;
    }

    public isMsValid(input: string): boolean {
        try {
            const res = ms(input as StringValue);

            return !Number.isNaN(res);
        } catch {
            return false;
        }
    }

    public async isDestinationSafe(destination: string): Promise<boolean> {
        this._logger.debug(`Scanning URL "${destination}"`);

        const { data } = await this._safebrowsing.threatMatches.find({
            auth: this._config.getOrThrow<string>('GOOGLEAPIS_SAFEBROWSING_KEY'),
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
            this._logger.log(`URL "${destination}" has ${matches.length} match(es)`);

            for (const match of matches) {
                this._logger.log(`URL "${match.threat.url}" is classified as a ${match.threatType} threat`);
            }

            return false;
        }

        this._logger.log(`URL "${destination}" appears to be safe`);

        return true;
    }

    /**
     * Deletes all Link documents whose `expiresAt` date is now or earlier.
     *
     * @returns {Promise<void>}
     */
    @Cron('* * * * *', { name: 'expireLinks' })
    private async _deleteExpiredLinks(): Promise<void> {
        const now   = new Date();
        const { deletedCount } = await this._links.deleteMany({ expiresAt: { $lte: now } });

        if (deletedCount > 0) {
            this._logger.log(`Deleted ${deletedCount} expired link(s)`);
        } else {
            this._logger.debug('No links to expire');
        }
    }

    private async _generateShortcode(): Promise<string> {
        let length    = 3;
        let shortcode = await nanoid(length);
        let exists    = false;
        do {
            // theoretically this could go on forever, but do you really think it would?
            exists = await this._links.exists({ shortcode }) !== null;
            length++;
        } while (exists)

        return shortcode;
    }

    private async _generateDeletionKey(): Promise<string> {
        return new Promise((resolve) => resolve(randomUUID()));
    }
}
