import { configure, renderFileAsync } from 'eta';
import { VIEWS_PATH }                 from '~constants';
import { Injectable }                 from '@nestjs/common';
import { ConfigService }              from '@nestjs/config';

@Injectable()
export class ViewsService {
    public constructor(config: ConfigService) {
        const production = config.getOrThrow<string>('ENV') === 'production';
        configure({
            async: true,
            cache: production,
            views: VIEWS_PATH,
            autoTrim: production ? ['nl', 'slurp'] : false,
            rmWhitespace: production,
        });
    }

    public async renderView(name: string, viewData: object): Promise<string> {
        return await renderFileAsync(name, viewData);
    }
}
