import '~/assets/css/app.scss';
import App from '~/App.vue';
import router from '~/router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import vuetify from '~/plugins/vuetify';
import hljs from '~/plugins/highlightjs';
import { useTetraStore } from '~/stores/tetra';

const app = createApp(App)
	.use(router)
	.use(vuetify)
	.use(hljs)
	.use(createPinia())
	.component('hljs', hljs.component);

// Load backend data into store as early as possible
const store = useTetraStore();
const csrfConfigElement = document.querySelector('meta[name="config/csrf-token"]') as HTMLMetaElement;
if (csrfConfigElement) {
	store.csrfToken = csrfConfigElement.content;
	app.mount('#app');
} else {
	document.body.innerHTML = '<h1 style="font-size:36px;text-align:center;">Failed to load backend data, app element not found.</h1>';
}
