import { ref } from 'vue';
import { useBridge } from '~/composables/useBridge';
import type { Ref } from 'vue';

interface IAPIRequestResponse {
	ok:      Ref<boolean>;
	status:  Ref<number>;
	success: Ref<boolean>;
	getJSON: <T>() => Promise<T>;
}

export async function useApi(endpoint: string, init: RequestInit = {}): Promise<IAPIRequestResponse> {
	const bridge = useBridge();

	const ok      = ref(false);
	const status  = ref(0);
	const success = ref(false);

	const res = await fetch(endpoint, {
		body: init.body,
		method: init.method,
		headers: {
			'Content-Type': 'application/json',
			'X-Csrf-Token': bridge.ajaxToken,
			...init.headers
		}
	});

	ok.value      = res.ok;
	status.value  = res.status;
	success.value = res.status < 300;

	async function getJSON<T>() {
		return await res.json() as T;
	};

	return { ok, status, success, getJSON };
}
