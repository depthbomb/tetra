import { Post, Controller } from '@nestjs/common';
import { InternalService }  from '~modules/internal/internal.service';

@Controller('internal')
export class InternalController {
    public constructor(private readonly _internal: InternalService) {}

    @Post('links-count')
    public async getLinksCount() {
        const count = await this._internal.getTotalLinksCount();

        return { count };
    }
}
