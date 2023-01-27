import { Module }       from '@nestjs/common';
import { ViewsService } from '~modules/views/views.service';

@Module({
    providers: [ViewsService],
    exports: [ViewsService]
})
export class ViewsModule {}
