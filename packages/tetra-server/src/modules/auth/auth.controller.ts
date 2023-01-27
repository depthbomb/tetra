import { Req, Res, Get, Post, Body, Controller } from '@nestjs/common';
import { AuthService }                           from '~modules/auth/auth.service';
import { LoginDto }                              from '~modules/auth/dto/login.dto';
import { UsersService }                          from '~modules/users/users.service';
import type { Request, Response }                from 'express';

@Controller('auth')
export class AuthController {
    private readonly _auth: AuthService;
    private readonly _users: UsersService;

    public constructor(auth: AuthService, users: UsersService) {
        this._auth  = auth;
        this._users = users;
    }

    @Post('login')
    public async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<{ id: string; username: string }> {
        const { accessToken, payload } = await this._auth.loginViaLocal(body);

        res.cookie('tetraJwt', accessToken);

        return payload;
    }

    @Get('profile')
    public async getProfile(@Req() req: Request) {
        return req.user;
    }
}
