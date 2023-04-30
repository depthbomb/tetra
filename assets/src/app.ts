import '~/assets/css/app.scss';
import App from '~/App.vue';
import { createApp } from 'vue';
import { router } from '~/router';
import { createPinia } from 'pinia';

createApp(App)
	.use(router)
	.use(createPinia())
	.mount('#app');
