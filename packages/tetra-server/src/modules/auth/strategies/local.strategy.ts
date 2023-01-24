import { Strategy }                                  from 'passport-local';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy }                          from '@nestjs/passport';
import { AuthService }                               from '~modules/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly _auth: AuthService;
    private readonly _log = new Logger(LocalStrategy.name);

    public constructor(auth: AuthService) {
        super();

        this._auth = auth;
    }

    public async validate(username: string, password: string): Promise<any> {
        try {
            this._log.log(`Attempting to authenticate user "${username}"...`);

            const user = await this._auth.validateUserCredentials(username, password);

            this._log.log(`User "${username}" authenticated successfully`);

            return user;
        } catch (err: unknown) {
            const error = err as Error;
            this._log.error(error);
            throw new UnauthorizedException('Username or password is incorrect', { cause: error });
        }
    }
}
