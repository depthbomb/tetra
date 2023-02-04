import 'source-map-support/register';
import { log } from '~logger';
import { connect } from 'mongoose';
import { getEnv, getOrThrow } from '~config';
import { startServer } from '~services/tetra';

const _logger = log.getSubLogger({ name: 'BOOT' });
const _connetionString = getEnv<string>('TETRA_DATABASE_CONNECTION_STRING') ?? getOrThrow<string>('database.connectionString');

connect(_connetionString).then(async () => {
	_logger.info('Connected to database, starting web service...');

	await startServer();

	_logger.info('Web service started!');
});
