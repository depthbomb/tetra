import { Req, Res, Get, Controller, InternalServerErrorException } from '@nestjs/common';
import { ConfigService }                                           from '@nestjs/config';
import { SpaService }                                              from '~modules/spa/spa.service';
import { AuthService }                                             from '~modules/auth/auth.service';
import type { Request, Response }                                  from 'express';

@Controller()
export class SpaController {
    private readonly _cspNonceExtractionPattern: RegExp = /nonce-([a-zA-Z0-9-_]{32})/;

    public constructor(
        private readonly _spa: SpaService,
        private readonly _auth: AuthService,
        private readonly _config: ConfigService,
    ) {}

    @Get('/')
    public async getSpa(@Req() req: Request, @Res() res: Response): Promise<void> {
        const cspNonce  = await this._extractCspNonceFromHeaders(res);
        const clientJs  = await this._spa.generateVersionedAssetTag('app.ts', cspNonce);
        const clientCss = await this._spa.generateVersionedAssetTag('app.css');
        const csrfToken = await this._auth.createCsrfToken(req);
        return res.render('spa', {
            clientJs,
            clientCss,
            csrfToken,
            cache: this._config.get<string>('ENV') === 'production'
        });
    }

    private async _extractCspNonceFromHeaders(res: Response): Promise<string> {
        const cspHeader     = <string>res.getHeader('Content-Security-Policy');
        const cspNonceMatch = cspHeader.match(this._cspNonceExtractionPattern);
        if (cspNonceMatch) {
            return cspNonceMatch[1];
        }

        throw new InternalServerErrorException('CSP Nonce could not be extracted from headers');
    }
}
