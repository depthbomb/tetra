import { Req, Res, Get, Controller, InternalServerErrorException } from '@nestjs/common';
import { ConfigService }                                           from '@nestjs/config';
import { SpaService }                                              from '~modules/spa/spa.service';
import { AuthService }                                             from '~modules/auth/auth.service';
import type { Request, Response }                                  from 'express';

@Controller()
export class SpaController {
    private readonly _spa: SpaService;
    private readonly _auth: AuthService;
    private readonly _config: ConfigService;
    private readonly _cspNonceExtractionPattern: RegExp;

    public constructor(spa: SpaService, auth: AuthService, config: ConfigService) {
        this._spa                       = spa;
        this._auth                      = auth;
        this._config                    = config;
        this._cspNonceExtractionPattern = /nonce-([a-zA-Z0-9-_]{32})/;
    }

    @Get('/')
    public async getSpa(@Req() req: Request, @Res() res: Response): Promise<void> {
        const cspNonce  = await this._extractCspNonceFromHeaders(res);
        const clientJs  = await this._spa.generateVersionedAssetTag('app.ts', cspNonce);
        const clientCss = await this._spa.generateVersionedAssetTag('app.css');
        const csrfToken = await this._auth.createCsrfToken(req);
        const user      = await this._serializeUserObject(req);
        return res.render('spa', {
            clientJs,
            clientCss,
            csrfToken,
            user,
            cache: this._config.get<string>('ENV') === 'production'
        });
    }

    private async _serializeUserObject(req: Request): Promise<any|null> {
        if (req.user && 'user' in req) {
            return encodeURIComponent(JSON.stringify({
                id: req.user.id,
                username: req.user.username
            }));
        }

        return null;
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
