import { Get, Res, Param, Controller, NotFoundException } from '@nestjs/common';
import { LinksService }                                   from '~modules/links/links.service';
import type { Response }                                  from 'express';

@Controller()
export class AppController {
    private readonly _links: LinksService;

    public constructor(links: LinksService) {
        this._links = links;
    }

    @Get(':shortcode')
    public async tryRedirectToDestination(@Param('shortcode') shortcode: string, @Res() res: Response) {
        const info = await this._links.getRedirectionInfo(shortcode);
        if (info) {
            const { destination, expiresAt } = info;
            // If the link will eventually expire (and thus no longer redirect) then use a temporary redirect status
            const statusCode = expiresAt !== null ? 302 : 301;
            return res.redirect(statusCode, destination);
        }

        throw new NotFoundException();
    }
}
