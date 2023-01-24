import { JwtService }               from '@nestjs/jwt';
import { Injectable }               from '@nestjs/common';
import { UserDocument }             from '~modules/users/users.schema';
import { UsersService }             from '~modules/users/users.service';
import { CryptoService }            from '~modules/crypto/crypto.service';
import type { Request }             from 'express';
import type { IGenericJwtResponse } from '~@types/IGenericJwtResponse';

@Injectable()
export class AuthService {
    public constructor(
        private readonly _jwt: JwtService,
        private readonly _users: UsersService,
        private readonly _crypto: CryptoService,
    ) {}

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

    public async loginViaLocal(user: UserDocument): Promise<IGenericJwtResponse> {
        const { _id, username } = user;
        const payload = { username, sub: _id };
        const token = await this._jwt.signAsync(payload);
        return {
            access_token: token
        };
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
