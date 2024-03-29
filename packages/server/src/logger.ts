import { getVar } from '@env';
import { Logger } from 'tslog';
import { flags } from '@flags';

export const logger = new Logger({
	type: flags.dev ? 'pretty' : 'json',
	minLevel: flags.dev ? 'silly' : 'info',
	displayFunctionName: false,
	dateTimeTimezone: getVar('LOGGER_TIMEZONE', 'America/Chicago'),
	dateTimePattern: 'year-month-day hour:minute:second',
});
