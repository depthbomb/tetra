import '~/assets/css/app.scss';
import 'floating-vue/dist/style.css';
import App from '~/App.vue';
import { createApp } from 'vue';
import { router } from '~/router';
import { createPinia } from 'pinia';
import { FloatingVue } from '~/plugins/floatingVue';

createApp(App)
	.use(router)
	.use(createPinia())
	.use(FloatingVue)
	.mount('#app');
