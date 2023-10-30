import { database } from '@database';

export class Features {
	private constructor() {}

	public static async create(name: string, enabled: boolean): Promise<void> {
		const exists = await this.exists(name);
		if (!exists) {
			await database.feature.create({
				data: {
					name,
					enabled
				}
			});
		}
	}

	public static async isEnabled(name: string): Promise<boolean> {
		await this._assertFeatureExists(name);

		const feature = await database.feature.findFirst({ where: { name } });

		return feature!.enabled;
	}

	public static async isDisabled(name: string): Promise<boolean> {
		return !this.isEnabled(name);
	}

	public static async enable(name: string): Promise<void> {
		await this._assertFeatureExists(name);
		await database.feature.update({
			where: {
				name
			},
			data: {
				enabled: true
			}
		});
	}

	public static async disable(name: string): Promise<void> {
		await this._assertFeatureExists(name);
		await database.feature.update({
			where: {
				name
			},
			data: {
				enabled: false
			}
		});
	}

	public static async toggle(name: string): Promise<boolean> {
		await this._assertFeatureExists(name);
		const record = await database.feature.findFirst({ where: { name }, select: { enabled: true } });
		const inverse = !record!.enabled;
		await database.feature.update({
			where: {
				name
			},
			data: {
				enabled: inverse
			}
		});

		return inverse
	}

	public static async getAll() {
		return database.feature.findMany({
			select: {
				name: true,
				enabled: true
			},
			orderBy: [
				{
					createdAt: 'asc'
				}
			]
		});
	}

	public static async getEnabled(): Promise<string[]> {
		const features = await database.feature.findMany({ where: { enabled: true }, select: { name: true } });
		return features.map(f => f.name);
	}

	public static async getDisabled(): Promise<string[]> {
		const features = await database.feature.findMany({ where: { enabled: false }, select: { name: true } });
		return features.map(f => f.name);
	}

	public static async exists(name: string): Promise<boolean> {
		return database.feature.exists({ name });
	}

	private static async _assertFeatureExists(name: string): Promise<void | Error> {
		const exists = await this.exists(name);
		if (!exists) {
			throw new Error(`Feature does not exist: ${name}`);
		}
	}
}
