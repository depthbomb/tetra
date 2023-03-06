<script setup lang="ts">
	import gsap from 'gsap';
	import { useGitStore } from '~/stores/git';
	import { useTetraStore } from '~/stores/tetra';
	import { makeApiRequest } from '~/services/api';
	import CodeIcon from '~/components/icons/CodeIcon.vue';
	import { HubConnectionBuilder } from '@microsoft/signalr';
	import { ref, watch, reactive, onMounted, onUnmounted } from 'vue';
	import CurlyBracesIcon from '~/components/icons/CurlyBracesIcon.vue';
	import type { IInternalLatestCommitHashResponse } from '~/@types/IInternalLatestCommitHashResponse';

	const totalShortlinksMethodName = 'TotalShortlinks';
	const store                     = useTetraStore();
	const gitStore                  = useGitStore();
	const totalLinks                = ref(0);
	const tweened                   = reactive({ number: 0 });
	const connection                = new HubConnectionBuilder().withUrl(store.statsHubEndpoint).build();

	const onTotalShortlinks = (count: number) => totalLinks.value = count;

	onMounted(async () => {
		connection.on(totalShortlinksMethodName, onTotalShortlinks);

		await connection.start();
		await connection.invoke('RequestTotalShortlinks');

		makeApiRequest<IInternalLatestCommitHashResponse>('/internal/latest-commit', { method: 'POST' }).then(({ hash }) => {
			gitStore.latestSha = hash;
		}).catch(err => {
			console.error('Failed to retrieve latest commit SHA, using fallback value');
			gitStore.latestSha = 'Source';
		});
	});
	onUnmounted(async () => {
		await connection.stop();
		connection.off(totalShortlinksMethodName, onTotalShortlinks);
	});

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));
</script>

<template>
	<footer class="footer">
		<div class="footer__content">
			<p>Serving <strong>{{ tweened.number.toFixed(0) }}</strong> links</p>
			<span>|</span>
			<router-link :to="{ name: 'api-docs' }">
				<curly-braces-icon class="inline-block h-3"/>
				<span>API Docs</span>
			</router-link>
			<span>|</span>
			<a href="https://github.com/depthbomb/tetra" target="_blank">
				<code-icon class="inline-block h-3"/>
				<span>{{ gitStore.shortenedLatestSha }}</span>
			</a>
		</div>
	</footer>
</template>

<style scoped lang="scss">
	.footer {
		@apply flex justify-center items-center flex-shrink-0;
		@apply py-3;
		@apply space-y-2;
		@apply text-white text-sm text-center;
		@apply border-t border-gray-700;

		.footer__content {
			@apply flex flex-row justify-center items-center;
			@apply space-x-2;

			a {
				@apply flex items-center;
				@apply space-x-1;
				@apply hover:text-brand;
				@apply transition-colors;
			}
		}
	}
</style>
