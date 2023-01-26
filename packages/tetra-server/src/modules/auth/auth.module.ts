import { JwtModule }                                             from '@nestjs/jwt';
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { ConfigService }                                         from '@nestjs/config';
import { AuthService }                                           from '~modules/auth/auth.service';
import { AuthMiddleware }                                        from '~middleware/auth.middleware';
import { UsersModule }                                           from '~modules/users/users.module';
import { AuthController }                                        from '~modules/auth/auth.controller';
import { CryptoModule }                                          from '~modules/crypto/crypto.module';

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
        CryptoModule
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): any {
        consumer
            .apply(AuthMiddleware)
            .exclude({ path: 'auth/login', method: RequestMethod.POST })
            .forRoutes(AuthController);
    }
}
