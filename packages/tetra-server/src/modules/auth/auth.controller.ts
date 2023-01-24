import { Get, Post, Request, UseGuards, Controller } from '@nestjs/common';
import { AuthService }                               from '~modules/auth/auth.service';
import { JwtAuthGuard }                              from '~modules/auth/guards/jwt-auth.guard';
import { LocalAuthGuard }                            from '~modules/auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    private readonly _auth: AuthService

    public constructor(auth: AuthService) {
        this._auth = auth;
    }

    // @Post('login')
    // @UseGuards(LocalAuthGuard)
    // public async login(@Request() req) {
    //     return await this._auth.loginViaLocal(req.user);
    // }
    //
    // @Get('profile')
    // @UseGuards(JwtAuthGuard)
    // public async getProfile(@Request() req) {
    //     return req.user;
    // }
}
