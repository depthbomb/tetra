<script setup lang="ts">
// TODO rename this layout

import { ref, watch, reactive, defineAsyncComponent } from 'vue';
import gsap                                           from 'gsap'
import { useIntervalFn }                              from '@vueuse/core';
import { useTetraStore }                              from '~/stores/tetra';
import { getApiData }                                 from '~/services/api';
import type { IInternalStatsResponse }                from '~/@types/IInternalStatsResponse';

const CodeIcon        = defineAsyncComponent(() => import('~/components/icons/CodeIcon.vue'));
const CurlyBracesIcon = defineAsyncComponent(() => import('~/components/icons/CurlyBracesIcon.vue'));

const store      = useTetraStore();
const totalLinks = ref(0);
const tweened    = reactive({ number: 0 });

watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));

useIntervalFn(async () => {
    const { results } = await getApiData<IInternalStatsResponse>('internal.stats');

    totalLinks.value = results;
}, 5_000, { immediateCallback: true });
</script>

<template>
    <main class="Home">
        <div class="Home-container">
            <router-link :to="{ name: 'home' }" class="Home-header">&lt;title here&gt;</router-link>
            <slot></slot>
            <div class="Home-footer">
                <div class="Home-footerLinks">
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
            </div>
        </div>
    </main>
</template>

<style scoped lang="scss">
.Home {
    @apply flex flex-col items-center justify-center;
    @apply w-full h-screen;
    @apply bg-gradient-to-br from-[#ff1166] to-[#ff0932];

    .Home-container {
        @apply block;
        @apply py-9 px-12;
        @apply max-w-screen-lg;

        .Home-header {
            @apply block;
            @apply mb-6;
            @apply text-7xl text-white text-center;
            @apply font-serif;
            @apply drop-shadow;
        }

        .Home-footer {
            @apply mt-3;
            @apply space-y-2;
            @apply text-white text-opacity-90 text-center;
            @apply drop-shadow-sm;

            .Home-footerLinks {
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
    }
}
</style>
