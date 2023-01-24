import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule }                         from '@nestjs/mongoose';
import { InternalService }                        from './internal.service';
import { InternalController }                     from './internal.controller';
import { AuthModule }                             from '~modules/auth/auth.module';
import { Link, LinksSchema }                      from '~modules/links/links.schema';
import { CsrfValidatorMiddleware }                from '~middleware/csrf-validator.middleware';

@Module({
    imports: [AuthModule, MongooseModule.forFeature([{ name: Link.name, schema: LinksSchema }])],
    providers: [InternalService],
    controllers: [InternalController]
})
export class InternalModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): any {
        consumer.apply(CsrfValidatorMiddleware).forRoutes(InternalController);
    }
}
