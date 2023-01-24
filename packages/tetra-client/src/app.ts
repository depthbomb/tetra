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
const appElement = document.querySelector('#app') as HTMLMetaElement;
if (appElement) {
    if ('csrfToken' in appElement.dataset) {
        store.csrfToken = appElement.dataset.csrfToken!;
    } else {
        throw new Error('Failed to load backend data, CSRF token data attribute not found.');
    }
} else {
    // TODO handle this better?
    throw new Error('Failed to load backend data, app element not found.');
}

app.mount('#app');
