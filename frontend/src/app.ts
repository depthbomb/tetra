import '~/assets/css/app.css';
import App from '~/App.vue';
import { createApp } from 'vue';
import { router } from '~/router';
import { createPinia } from 'pinia';
import { useUserStore } from '~/stores/user';

const bootstrap = async () => {
	const app = createApp(App);
	const pinia = createPinia();

	app.use(pinia);

	await useUserStore(pinia).initialize();

	app.use(router);
	app.mount('#app');
};

void bootstrap();
