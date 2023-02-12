import 'source-map-support/register';
import { connect } from 'mongoose';
import { get, getEnv, getOrThrow, loadConfig } from '~config';

async function run(): Promise<void> {
	await loadConfig(['.tetrarc.dev', '.tetrarc']);
	const { log } = await import('~logger');
	const logger = log.getSubLogger({ name: 'BOOT' });
	const connectionString = getEnv<string>('TETRA_DATABASE_CONNECTION_STRING') ?? getOrThrow<string>('database.connectionString');
	const dbName = getEnv<string>('TETRA_DATABASE_NAME') ?? get<string>('database.name');

	connect(connectionString, { dbName }).then(async () => {
		logger.info('Connected to database, starting web service...');

		const { startServer } = await import('~modules/tetra');

		await startServer();

		logger.info('Web service started!');
	});
}

run();
