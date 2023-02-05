import 'source-map-support/register';
import { log } from '~logger';
import { connect } from 'mongoose';
import { getEnv, getOrThrow } from '~config';
import { startServer } from '~services/tetra';

const _logger = log.getSubLogger({ name: 'BOOT' });
const _connectionString = getEnv<string>('TETRA_DATABASE_CONNECTION_STRING') ?? getOrThrow<string>('database.connectionString');

connect(_connectionString).then(async () => {
	_logger.info('Connected to database, starting web service...');

	await startServer();

	_logger.info('Web service started!');
});
