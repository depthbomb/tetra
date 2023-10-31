import { logger } from '@logger';
import { Duration } from '@sapphire/duration';

export type Task = {
	name: string;
	description: string;
	once?: boolean;
	immediate?: boolean;
	interval: string;
	nextRun: Date | null;
	lastRun: Date | null;
	execute(): Promise<unknown>;
};

export const taskRegistry: Task[] = [];

export async function registerTask(task: Task) {
	const { name, once, immediate, interval } = task;
	const duration                            = new Duration(interval);

	task.nextRun = duration.fromNow;

	taskRegistry.push(task);

	if (once) {
		if (immediate) {
			logger.warn('`once` tasks cannot be immediate');
		}

		setTimeout(async () => await _executeTask(task), duration.offset);
	} else {
		if (immediate) {
			await _executeTask(task);
		}

		setInterval(async () => await _executeTask(task), duration.offset);
	}

	logger.debug('Registered task', { name, duration });
}

async function _executeTask(task: Task): Promise<void> {
	const t = taskRegistry.find(t => t === task);

	if (!t) {
		return;
	}

	await t.execute();

	t.lastRun = new Date();
	if (!t.once) {
		t.nextRun = new Duration(t.interval).fromNow;
	}
}
