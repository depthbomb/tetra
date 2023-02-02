import 'source-map-support/register';
import { getOrThrow }  from '~config';
import { log }         from '~logger';
import { connect }     from 'mongoose';
import { startServer } from '~services/tetra';

const _logger = log.getSubLogger({ name: 'BOOT' });

connect(getOrThrow<string>('database.connectionString')).then(async () => {
	_logger.info('Connected to database, starting web service...');

	await startServer();

	_logger.info('Web service started!');
});
