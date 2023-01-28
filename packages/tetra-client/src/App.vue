<script setup lang="ts">
import { ref, watch, reactive }        from 'vue';
import gsap                            from 'gsap'
import { RouterView }                  from 'vue-router';
import { useIntervalFn }               from '@vueuse/core';
import { makeApiRequest }              from '~/services/api';
import type { IInternalStatsResponse } from '~/@types/IInternalStatsResponse';

const totalLinks = ref(0);
const tweened    = reactive({ number: 0 });

watch(totalLinks, n => gsap.to(tweened, { duration: 1.5, number: n || 0 }));

useIntervalFn(async () => {
    makeApiRequest<IInternalStatsResponse>('internal:links-count', { method: 'POST' })
        .then(({ count }) => totalLinks.value = count)
        .catch(err => console.error(err));
}, 5_000, { immediateCallback: true });
</script>

<template>
    <v-app>
        <v-app-bar app density="compact" color="blue">
            <v-app-bar-title class="font-serif">go.super.fish</v-app-bar-title>
            <v-btn :to="{ name: 'home' }" prepend-icon="mdi-link-variant" color="white">Home</v-btn>
            <v-btn :to="{ name: 'api-docs' }" prepend-icon="mdi-code-json" color="white">API</v-btn>
            <v-btn href="https://github.com/depthbomb/tetra" target="_blank" prepend-icon="mdi-xml" color="white">Source</v-btn>
        </v-app-bar>
        <v-main>
            <v-container fluid class="d-flex flex-column align-center">
                <router-view/>
            </v-container>
        </v-main>
        <v-footer app>Hosting {{ tweened.number.toFixed(0) }} shortlinks</v-footer>
    </v-app>
</template>
