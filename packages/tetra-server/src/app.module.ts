import { APP_GUARD }                           from '@nestjs/core';
import { Module, CacheModule }                 from '@nestjs/common';
import { ConfigModule, ConfigService }         from '@nestjs/config';
import { AppController }                       from '~app.controller';
import { ScheduleModule }                      from '@nestjs/schedule';
import { MongooseModule }                      from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule }     from '@nestjs/throttler';
import { SpaModule }                           from '~modules/spa/spa.module';
import { AuthModule }                          from '~modules/auth/auth.module';
import { UsersModule }                         from '~modules/users/users.module';
import { LinksModule }                         from '~modules/links/links.module';
import { InternalModule }                      from '~modules/internal/internal.module';
import { RequestIdMiddleware }                 from '~middleware/request-id.middleware';
import { HttpLoggerMiddleware }                from '~middleware/http-logger.middleware';
import type { NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.production', '.env.development', '.env'] }),
        CacheModule.register({ isGlobal: true }),
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ttl: config.getOrThrow<number>('GLOBAL_RATELIMIT_TTL'),
                limit: config.getOrThrow<number>('GLOBAL_RATELIMIT_LIMIT')
            })
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('DB_CONNECTION_STRING') })
        }),
        ScheduleModule.forRoot(),
        SpaModule,
        LinksModule,
        InternalModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard }
    ]
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): any {
        consumer.apply(RequestIdMiddleware, HttpLoggerMiddleware).forRoutes('*');
    }
}
