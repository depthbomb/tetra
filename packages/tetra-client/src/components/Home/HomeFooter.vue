<script setup lang="ts">
	import gsap from 'gsap'
	import { ref, watch, reactive } from 'vue';
	import { useIntervalFn } from '@vueuse/core';
	import { useTetraStore } from '~/stores/tetra';
	import { makeApiRequest } from '~/services/api';
	import CodeIcon from '~/components/icons/CodeIcon.vue';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import BrowserIcon from '~/components/icons/BrowserIcon.vue';
	import CurlyBracesIcon from '~/components/icons/CurlyBracesIcon.vue';
	import type { IInternalStatsResponse } from '@tetra/common';

	const store      = useTetraStore();
	const totalLinks = ref(0);
	const tweened    = reactive({ number: 0 });

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));

	useIntervalFn(async () => {
		makeApiRequest<IInternalStatsResponse>('/internal/links-count', { method: 'POST' })
			.then(({ count }) => totalLinks.value = count)
			.catch(err => console.error(err));
	}, 5_000, { immediateCallback: true });
</script>

<template>
	<footer class="footer">
		<div class="footer__links">
			<a v-if="!store.loggedIn" href="/auth/login">
				<sign-in-icon class="inline-block h-4"/>
				<span>Log In</span>
			</a>
			<router-link v-else-if="store.loggedIn" :to="{ name: 'dashboard' }">
				<browser-icon class="inline-block h-4"/>
				<span>Dashboard</span>
			</router-link>
			<router-link :to="{ name: 'api-docs' }">
				<curly-braces-icon class="inline-block h-4"/>
				<span>API</span>
			</router-link>
			<a href="https://github.com/depthbomb/tetra">
				<code-icon class="inline-block h-4"/>
				<span>Source Code</span>
			</a>
		</div>
		<p>Serving <strong>{{ tweened.number.toFixed(0) }}</strong> links</p>
	</footer>
</template>

<style scoped lang="scss">
	.footer {
		@apply mt-3;
		@apply space-y-2;
		@apply text-white text-opacity-90 text-center;
		@apply drop-shadow-sm;

		.footer__links {
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
