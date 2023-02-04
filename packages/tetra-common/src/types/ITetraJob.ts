export interface ITetraJob {
	name: string;
	description: string;
	interval: string;
	lastRan?: Date;
	nextRun?: Date;
	onRegistered?(): Promise<void>;
	execute(): Promise<void>;
}
