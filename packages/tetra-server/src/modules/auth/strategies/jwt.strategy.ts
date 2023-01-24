import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable }           from '@nestjs/common';
import { ConfigService }        from '@nestjs/config';
import { PassportStrategy }     from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    public constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromBodyField('accessToken'),
                ExtractJwt.fromUrlQueryParameter('accessToken'),
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET')
        });
    }

    public async validate(payload: any) {
        return { id: payload.sub, username: payload.username };
    }
}
