import 'source-map-support/register';
import { log } from '~logger';
import { connect } from 'mongoose';
import { startServer } from '~services/tetra';
import { get, getEnv, getOrThrow } from '~config';

async function run(): Promise<void> {
	if (process.argv[2] === 'run') {
		const logger = log.getSubLogger({ name: 'CLI' });
		let exitCode = 0;
		try {
			const { runCli } = await import('~cli');
			exitCode = await runCli();
		} catch (err) {
			logger.error(err);
		} finally {
			process.exit(exitCode);
		}
	} else {
		const logger = log.getSubLogger({ name: 'BOOT' });
		const connectionString = getEnv<string>('TETRA_DATABASE_CONNECTION_STRING') ?? getOrThrow<string>('database.connectionString');
		const dbName = getEnv<string>('TETRA_DATABASE_NAME') ?? get<string>('database.name');

		connect(connectionString, { dbName }).then(async () => {
			logger.info('Connected to database, starting web service...');

			await startServer();

			logger.info('Web service started!');
		});
	}
}

run();
