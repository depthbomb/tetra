import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SpaService }                             from '~modules/spa/spa.service';
import { AuthModule }                             from '~modules/auth/auth.module';
import { CspMiddleware }                          from '~middleware/csp.middleware';
import { SpaController }                          from '~modules/spa/spa.controller';
import { ViewsModule }                            from '~modules/views/views.module';

@Module({
    imports: [AuthModule, ViewsModule],
    controllers: [SpaController],
    providers: [SpaService]
})
export class SpaModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): any {
        consumer.apply(CspMiddleware).forRoutes(SpaController);
    }
}
