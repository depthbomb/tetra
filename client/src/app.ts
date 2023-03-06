import '~/assets/css/app.scss';
import App from '~/App.vue';
import router from '~/router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useTetraStore } from '~/stores/tetra';

const app = createApp(App)
    .use(router)
    .use(createPinia());

// Load backend data into store as early as possible
const tetraStore         = useTetraStore();
const setupConfigElement =  document.querySelector('meta[name="tetra/config/setup"]') as HTMLMetaElement;
if (setupConfigElement) {
	const user = setupConfigElement.dataset.user;

	tetraStore.csrfToken        = setupConfigElement.dataset.csrfToken!;
	tetraStore.statsHubEndpoint = setupConfigElement.dataset.statsHub!;

	if (user) {
		const payload = JSON.parse(decodeURIComponent(user));
		if (Object.keys(payload)) {
			tetraStore.username = payload.username;
			tetraStore.avatar   = payload.avatar;
			tetraStore.id       = payload.id;
			tetraStore.admin    = payload.admin;
		}
	}

	app.mount('#app');
} else {
	document.body.innerHTML = '<h1 style="font-size:36px;text-align:center;">Failed to load backend data, app element not found.</h1>';
}
