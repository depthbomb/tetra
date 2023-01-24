import { JwtModule }      from '@nestjs/jwt';
import { Module }         from '@nestjs/common';
import { ConfigService }  from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService }    from '~modules/auth/auth.service';
import { UsersModule }    from '~modules/users/users.module';
import { AuthController } from '~modules/auth/auth.controller';
import { CryptoModule }   from '~modules/crypto/crypto.module';
import { JwtStrategy }    from '~modules/auth/strategies/jwt.strategy';
import { LocalStrategy }  from '~modules/auth/strategies/local.strategy';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.getOrThrow<number>('JWT_TTL')
                }
            })
        }),
        UsersModule,
        CryptoModule,
        PassportModule
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}
