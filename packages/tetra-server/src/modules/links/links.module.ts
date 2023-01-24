import { Module }            from '@nestjs/common';
import { MongooseModule }    from '@nestjs/mongoose';
import { Link, LinksSchema } from '~modules/links/links.schema';
import { LinksService }      from '~modules/links/links.service';
import { LinksController }   from '~modules/links/links.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Link.name, schema: LinksSchema }])],
    controllers: [LinksController],
    providers: [LinksService],
    exports: [LinksService]
})
export class LinksModule {}
