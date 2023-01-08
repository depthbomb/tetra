import '~/assets/css/app.scss';
import { createApp }     from 'vue';
import { createPinia }   from 'pinia';
import router            from '~/router';
import App               from '~/App.vue';
import { useTetraStore } from '~/stores/tetra';

const app = createApp(App)
    .use(router)
    .use(createPinia());

// Load backend data into store as early as possible
const store = useTetraStore();
const configElement = document.querySelector('meta[name="config"]') as HTMLMetaElement;
if (configElement) {
    store.$state = JSON.parse(decodeURIComponent(configElement.content));
} else {
    // TODO handle this better?
    throw new Error('Failed to load backend data, config element not found.');
}

app.mount('#app');
