import { Cli } from 'clipanion';
import { version } from '~/../../package.json';
import { DumpRoutesCommand } from '~cli/commands/dumpRoutes';

export async function runCli(): Promise<number> {
	const cli = new Cli({
		binaryLabel:   'Tetra CLI',
		binaryName:    process.argv[0],
		binaryVersion: version
	});

	cli.register(DumpRoutesCommand);

	const exitCode = await cli.run(process.argv.slice(3));

	return exitCode;
}
