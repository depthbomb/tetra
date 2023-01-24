import { Post, Controller } from '@nestjs/common';
import { InternalService }  from '~modules/internal/internal.service';

@Controller('internal')
export class InternalController {
    private readonly _internal: InternalService;

    public constructor(internal: InternalService) {
        this._internal = internal;
    }

    @Post('links-count')
    public async getLinksCount() {
        const count = await this._internal.getTotalLinksCount();

        return { count };
    }
}
