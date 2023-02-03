import 'source-map-support/register';
import { log } from '~logger';
import { connect } from 'mongoose';
import { getOrThrow } from '~config';
import { startServer } from '~services/tetra';

const _logger = log.getSubLogger({ name: 'BOOT' });

connect(getOrThrow<string>('database.connectionString')).then(async () => {
	_logger.info('Connected to database, starting web service...');

	await startServer();

	_logger.info('Web service started!');
});
