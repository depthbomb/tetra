<script setup lang="ts">
	import gsap from 'gsap';
	import { useTetraStore } from '~/stores/tetra';
	import CodeIcon from '~/components/icons/CodeIcon.vue';
	import { HubConnectionBuilder } from '@microsoft/signalr';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import BrowserIcon from '~/components/icons/BrowserIcon.vue';
	import { ref, watch, reactive, onMounted, onUnmounted } from 'vue';
	import CurlyBracesIcon from '~/components/icons/CurlyBracesIcon.vue';

	const totalShortlinksMethodName = 'TotalShortlinks';
	const store                     = useTetraStore();
	const totalLinks                = ref(0);
	const tweened                   = reactive({ number: 0 });
	const connection                = new HubConnectionBuilder().withUrl(store.statsHubEndpoint).build();

	const onTotalShortlinks = (count: number) => totalLinks.value = count;

	onMounted(async () => {
		connection.on(totalShortlinksMethodName, onTotalShortlinks);

		await connection.start();
		await connection.invoke('RequestTotalShortlinks');
	});
	onUnmounted(async () => {
		await connection.stop();
		connection.off(totalShortlinksMethodName, onTotalShortlinks);
	});

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));
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
