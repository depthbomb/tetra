import { Cli } from 'clipanion';
import { version } from '~/../../package.json';

export async function runCli(): Promise<number> {
	const cli = new Cli({
		binaryLabel:   'Tetra CLI',
		binaryName:    process.argv[0],
		binaryVersion: version
	});

	const exitCode = await cli.run(process.argv.slice(3));

	return exitCode;
}
