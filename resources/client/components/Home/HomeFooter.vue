<script setup lang="ts">
import { ref, watch, reactive, defineAsyncComponent } from 'vue';
import gsap                                           from 'gsap'
import { useIntervalFn }                              from '@vueuse/core';
import { getApiData }                                 from '~/services/api';
import type { IInternalStatsResponse }                from '~/@types/IInternalStatsResponse';

const CodeIcon        = defineAsyncComponent(() => import('~/components/icons/CodeIcon.vue'));
const CurlyBracesIcon = defineAsyncComponent(() => import('~/components/icons/CurlyBracesIcon.vue'));

const totalLinks = ref(0);
const tweened    = reactive({ number: 0 });

watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));

useIntervalFn(async () => {
    const { results } = await getApiData<IInternalStatsResponse>('internal.stats');

    totalLinks.value = results;
}, 5_000, { immediateCallback: true });
</script>

<template>
    <footer class="Footer">
        <div class="Footer-links">
            <router-link :to="{ name: 'api-docs' }">
                <CurlyBracesIcon class="inline-block h-4"/>
                <span>API</span>
            </router-link>
            <a href="https://github.com/depthbomb/tetra">
                <CodeIcon class="inline-block h-4"/>
                <span>Source Code</span>
            </a>
        </div>
        <p>Serving <strong>{{ tweened.number.toFixed(0) }}</strong> links</p>
    </footer>
</template>

<style scoped lang="scss">
.Footer {
    @apply mt-3;
    @apply space-y-2;
    @apply text-white text-opacity-90 text-center;
    @apply drop-shadow-sm;

    .Footer-links {
        @apply flex flex-row justify-center items-center;
        @apply space-x-4;

        a {
            @apply flex items-center;
            @apply space-x-1;
            @apply text-brand-50;
            @apply border-b border-dashed border-brand-200;
            @apply hover:text-white;
            @apply hover:border-solid hover:border-white;
        }
    }
}
</style>
