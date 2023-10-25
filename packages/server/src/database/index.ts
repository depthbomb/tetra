import { Prisma, PrismaClient } from '@prisma/client';

export const database = new PrismaClient()
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
