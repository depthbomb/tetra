type FeaturesDict = {
	[name: string]: boolean;
};

export class Features {
	private static readonly _features: FeaturesDict = {};

	private constructor() {}

	public static create(name: string, enabled: boolean): void {
		if (name in this._features) {
			throw new Error(`Feature already exists: ${name}`);
		}

		this._features[name] = enabled;
	}

	public static isEnabled(name: string): boolean {
		return this._features[name] === true;
	}

	public static isDisabled(name: string): boolean {
		return !this.isEnabled(name);
	}

	public static enable(name: string): void {
		this._features[name] = true;
	}

	public static disable(name: string): void {
		this._features[name] = false;
	}

	public static toggle(name: string): boolean {
		this._features[name] = !this._features[name];

		return this._features[name];
	}

	public static getAll(): FeaturesDict {
		return this._features;
	}

	public static getEnabled(): string[] {
		return Object.keys(this.getAll()).filter(f => this._features[f]);
	}

	public static getDisabled(): string[] {
		return Object.keys(this.getAll()).filter(f => !this._features[f]);
	}

	public static isValid(name: string): boolean {
		return name in this._features;
	}
}
