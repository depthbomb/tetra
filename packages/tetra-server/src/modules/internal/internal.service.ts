import { Model }               from 'mongoose';
import { Injectable }          from '@nestjs/common';
import { SchedulerRegistry }   from '@nestjs/schedule';
import { InjectModel }         from '@nestjs/mongoose';
import { Link, LinksDocument } from '~modules/links/links.schema';
import type { CronJob }        from 'cron';

@Injectable()
export class InternalService {
    public constructor(
        private readonly _tasks: SchedulerRegistry,
        @InjectModel(Link.name) private readonly _links: Model<LinksDocument>
    ) {}

    public async getCronJobs(): Promise<Map<string, CronJob>> {
        return this._tasks.getCronJobs();
    }

    public async getTotalLinksCount(): Promise<number> {
        return this._links.count();
    }
}
