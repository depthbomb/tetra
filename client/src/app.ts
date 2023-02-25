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
const tetraStore        = useTetraStore();
const userConfigElement = document.querySelector('meta[name="config/user"]') as HTMLMetaElement;
const csrfConfigElement = document.querySelector('meta[name="config/csrf-token"]') as HTMLMetaElement;
if (csrfConfigElement) {
	tetraStore.csrfToken = csrfConfigElement.content;

	if (userConfigElement) {
		const payload = JSON.parse(decodeURIComponent(userConfigElement.content));
		if (Object.keys(payload)) {
			tetraStore.username = payload.username;
			tetraStore.avatar   = payload.avatar;
			tetraStore.id       = payload.id;
		}
	}

	app.mount('#app');
} else {
	document.body.innerHTML = '<h1 style="font-size:36px;text-align:center;">Failed to load backend data, app element not found.</h1>';
}
