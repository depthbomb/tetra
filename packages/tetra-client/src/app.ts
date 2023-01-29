import '~/assets/css/app.scss';
import { createApp }     from 'vue';
import { createPinia }   from 'pinia';
import router            from '~/router';
import App               from '~/App.vue';
import { useTetraStore } from '~/stores/tetra';
import vuetify           from '~/plugins/vuetify';
import hljs              from '~/plugins/highlightjs';

const app = createApp(App)
    .use(router)
    .use(vuetify)
    .use(hljs)
    .use(createPinia());

// Load backend data into store as early as possible
const store = useTetraStore();
const csrfConfigElement = document.querySelector('meta[name="config/csrf-token"]') as HTMLMetaElement;
if (csrfConfigElement) {
    store.csrfToken = csrfConfigElement.content;
} else {
    // TODO handle this better?
    throw new Error('Failed to load backend data, app element not found.');
}

app.component('hljs', hljs.component);

app.mount('#app');
