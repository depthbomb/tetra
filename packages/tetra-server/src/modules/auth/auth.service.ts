import { JwtService }                                from '@nestjs/jwt';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto }                                  from '~modules/auth/dto/login.dto';
import { UserDocument }                              from '~modules/users/users.schema';
import { UsersService }                              from '~modules/users/users.service';
import { CryptoService }                             from '~modules/crypto/crypto.service';
import type { Request }                              from 'express';
import type { ILoginResponse }                       from '~modules/auth/interfaces/ILoginResponse';

@Injectable()
export class AuthService {
    private readonly _jwt: JwtService;
    private readonly _users: UsersService;
    private readonly _crypto: CryptoService;
    private readonly _logger: Logger;

    public constructor(jwt: JwtService, users: UsersService, crypto: CryptoService) {
        this._jwt    = jwt;
        this._users  = users;
        this._crypto = crypto;
        this._logger = new Logger(AuthService.name);
    }

    public async validateUserCredentials(username: string, password: string): Promise<UserDocument> {
        const requestedUser = await this._users.findUserByUsername(username);
        if (!requestedUser) {
            throw new Error(`Could not retrieve a user with the username "${username}"`);
        }

        const passwordIsValid = await this._crypto.verifyPassword(password, requestedUser.password);
        if (!passwordIsValid) {
            throw new Error(`Password validation failed for user "${requestedUser.username}"`)
        }

        return requestedUser;
    }

    public async loginViaLocal(user: LoginDto): Promise<ILoginResponse> {
        const { username, password } = user;

        try {
            this._logger.log(`Authenticating user "${username}"...`);

            const user = await this.validateUserCredentials(username, password);

            this._logger.log(`User "${username}" authenticated successfully`);

            const payload = { id: user.id, username };
            const accessToken = await this._jwt.signAsync(payload);

            return { accessToken, payload };
        } catch (err: unknown) {
            const error = err as Error;
            this._logger.error(error);
            throw new UnauthorizedException('Username or password is incorrect', { cause: error });
        }
    }

    public async getUserFromJwt(token: string): Promise<UserDocument|null> {
        const { id } = await this._jwt.verifyAsync(token);
        return this._users.findUserById(id);
    }

    public async createCsrfToken(req: Request): Promise<string> {
        return await this._jwt.signAsync({ ip: req.ip });
    }

    public async isCsrfTokenValid(token: string, req: Request): Promise<boolean> {
        try {
            const { ip } = await this._jwt.verifyAsync(token);
            return req.ip === ip;
        } catch {
            return false;
        }
    }
}
