import { Duration } from '@sapphire/duration';

export type Task = {
	name: string;
	once?: boolean;
	interval: string;
	execute(): Promise<unknown>;
};

export function registerTask(task: Task) {
	const { name, once, interval, execute } = task;
	const { offset }                        = new Duration(interval);

	if (once) {
		setTimeout(execute, offset);
	} else {
		setInterval(execute, offset);
	}

	console.log('Registered task', name, 'with interval', offset);
}
