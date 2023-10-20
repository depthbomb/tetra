import { getVarOrThrow } from '@env';
import { Prisma, PrismaClient } from '@prisma/client';

const PGHOST     = getVarOrThrow<string>('PGHOST');
const PGPORT     = getVarOrThrow<number>('PGPORT');
const PGDATABASE = getVarOrThrow<string>('PGDATABASE');
const PGUSER     = getVarOrThrow<string>('PGUSER');
const PGPASSWORD = getVarOrThrow<string>('PGPASSWORD');

const datasourceUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?schema=public`;

export const database = new PrismaClient({ datasourceUrl })
	.$extends({
		model: {
			$allModels: {
				async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
					const ctx = Prisma.getExtensionContext(this);
					const res = await (ctx as any).findFirst({ where });

					return res !== null;
				}
			}
		}
	});

export * from '@prisma/client';
