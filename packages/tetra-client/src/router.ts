import { createRouter, createWebHashHistory } from 'vue-router';

const HomeView = () => import('~/views/HomeView.vue');
const LinkInfoView = () => import('~/views/LinkInfoView.vue');
const ApiDocsView = () => import('~/views/ApiDocsView.vue');

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/',                name: 'home',      component: HomeView },
        { path: '/:shortcode\+',    name: 'link-info', component: LinkInfoView },
        { path: '/api',             name: 'api-docs',  component: ApiDocsView },
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ]
});
