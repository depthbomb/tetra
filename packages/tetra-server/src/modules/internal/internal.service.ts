import { Model }               from 'mongoose';
import { Injectable }          from '@nestjs/common';
import { SchedulerRegistry }   from '@nestjs/schedule';
import { InjectModel }         from '@nestjs/mongoose';
import { Link, LinksDocument } from '~modules/links/links.schema';
import type { CronJob }        from 'cron';

@Injectable()
export class InternalService {
    private readonly _tasks: SchedulerRegistry;
    private readonly _links: Model<LinksDocument>;

    public constructor(
        tasks: SchedulerRegistry,
        @InjectModel(Link.name) links: Model<LinksDocument>
    ) {
        this._tasks = tasks;
        this._links = links;
    }

    public async getCronJobs(): Promise<Map<string, CronJob>> {
        return this._tasks.getCronJobs();
    }

    public async getTotalLinksCount(): Promise<number> {
        return this._links.count();
    }
}
