import { STATIC_PATH }                 from '~constants';
import { AppModule }                   from '~app.module';
import { NestFactory }                 from '@nestjs/core';
import cookieParser                    from 'cookie-parser';
import { VersioningType }              from '@nestjs/common';
import { ConfigService }               from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express'

NestFactory.create<NestExpressApplication>(AppModule).then(async app => {
    app.enableVersioning({ type: VersioningType.URI });
    app.setGlobalPrefix('api', { exclude: ['/', 'auth/login', 'auth/profile', ':shortcode'] });

    app.useStaticAssets(STATIC_PATH);

    app.disable('x-powered-by');

    app.use(cookieParser());

    const config = app.get<ConfigService>(ConfigService);
    await app.listen(
        config.getOrThrow<number>('SERVER_PORT'),
        config.getOrThrow<string>('SERVER_HOSTNAME')
    );
});
