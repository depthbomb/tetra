import { ref } from 'vue';
import { useBridge } from '~/composables/useBridge';
import type { Ref } from 'vue';

interface IAPIRequestResponse {
	ok:      Ref<boolean>;
	status:  Ref<number>;
	success: Ref<boolean>;
	getJSON: <T>() => Promise<T>;
	getBody: () => Promise<string>;
}

export async function useApi(endpoint: string | Ref<string>, init: RequestInit = {}, loadingRef = ref(false)): Promise<IAPIRequestResponse> {
	const bridge = useBridge();

	const ok      = ref(false);
	const status  = ref(0);
	const success = ref(false);

	loadingRef.value = true;

	if (typeof endpoint !== 'string') {
		endpoint = endpoint.value;
	}

	const res = await fetch(endpoint, {
		body: init.body,
		method: init.method,
		headers: {
			'Content-Type': 'application/json',
			'X-Csrf-Token': bridge.ajaxToken,
			...init.headers
		}
	});

	loadingRef.value = false;

	ok.value      = res.ok;
	status.value  = res.status;
	success.value = res.status < 300;

	async function getJSON<T>() {
		return await res.json() as T;
	};

	async function getBody() {
		return await res.text();
	};

	return { ok, status, success, getJSON, getBody };
}
