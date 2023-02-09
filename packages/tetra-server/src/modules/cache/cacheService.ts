import { Duration } from '@sapphire/duration';
import type { ICacheObject } from '@tetra/common';

const _internalCache = new Map<string, ICacheObject>();

export async function setItem(key: string, value: unknown, ttl?: string): Promise<void> {
	const obj: ICacheObject = { value };

	if (ttl) {
		obj.expiresAt = new Duration(ttl).fromNow;
	}

	_internalCache.set(key, obj);
}

export async function getItem<T>(key: string): Promise<T | null> {
	if (_internalCache.has(key)) {
		const { value, expiresAt } = _internalCache.get(key) as ICacheObject;

		if (expiresAt && expiresAt <= new Date()) {
			_internalCache.delete(key);
			return null;
		}

		return value as T;
	}

	return null;
}

export async function deleteItem(key: string): Promise<boolean> {
	return _internalCache.delete(key);
}
