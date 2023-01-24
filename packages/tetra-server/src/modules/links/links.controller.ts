import {
    Req,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Logger,
    Version,
    UsePipes,
    Controller,
    ValidationPipe,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common'; // lol
import ms                from 'ms';
import { Throttle }      from '@nestjs/throttler';
import { LinksService }  from '~modules/links/links.service';
import { CreateLinkDto } from '~modules/links/dto/create-link.dto';
import type { Request }  from 'express';

@Controller('links')
export class LinksController {
    private readonly _links: LinksService;
    private readonly _logger: Logger;

    public constructor(links: LinksService) {
        this._links  = links;
        this._logger = new Logger(LinksController.name);
    }

    @Post('create')
    @Version('1')
    @UsePipes(new ValidationPipe({ transform: true }))
    @Throttle(2, 1)
    public async createLink(@Body() body: CreateLinkDto, @Req() req: Request) {
        const { destination, duration, expiresAt } = body;

        let linkExpiresAt: Date = null;

        if (duration) {
            if (!this._links.isMsValid(duration)) {
                throw new BadRequestException('duration is invalid, valid values are derived from https://github.com/vercel/ms#examples');
            }

            const msDuration = ms(duration);
            if (msDuration < 60_000) {
                throw new BadRequestException('duration must have a minimum value of 1 minute (1m)');
            }

            linkExpiresAt = new Date(Date.now() + msDuration);
        }

        // inclusion of `expiresAt` overrides `duration`
        if (expiresAt) {
            linkExpiresAt = new Date(expiresAt);
            const differenceMs = (linkExpiresAt.getTime() - Date.now())
            if (differenceMs < 60_000) {
                throw new BadRequestException('duration must have a minimum value of 1 minute (1m)');
            }
        }

        try {
            const link = await this._links.createLink(req.ip, destination, linkExpiresAt);
            return {
                shortcode: link.shortcode,
                destination: link.destination,
                deletionKey: link.deletionKey,
                expiresAt: link.expiresAt,
            };
        } catch (err: unknown) {
            const error = <Error>err;
            this._logger.error(error);
            throw new InternalServerErrorException('Failed to create shortlink', { cause: error });
        }
    }

    @Delete('delete/:shortcode/:deletionKey')
    @Version('1')
    @Throttle(2, 1)
    public async deleteLink(
        @Param('shortcode') shortcode: string,
        @Param('deletionKey') deletionKey: string
    ) {
        try {
            await this._links.deleteLink(shortcode, deletionKey);
            return {};
        } catch (err: unknown) {
            const error = <Error>err;
            this._logger.error(error);
            throw new InternalServerErrorException('Failed to delete shortlink', { cause: error });
        }
    }

    @Get('info/:shortcode')
    @Version('1')
    public async getLinkInfo(@Param('shortcode') shortcode: string) {
        const info = await this._links.getRedirectionInfo(shortcode);
        if (info) {
            return {
                __NOTE: 'this will be a proper page soon',
                ...info
            };
        }

        throw new NotFoundException();
    }
}
