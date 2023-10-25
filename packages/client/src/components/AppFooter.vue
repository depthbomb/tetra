<script setup lang="ts">
	import gsap from 'gsap';
	import createClient from 'openapi-fetch';
	import { useEventSource } from '@vueuse/core';
	import { ref, watch, reactive, onMounted } from 'vue';
	import GithubIcon from '~/components/icons/GithubIcon.vue';
	import ExternalIcon from '~/components/icons/ExternalIcon.vue';
	import type { paths } from '~/@types/openapi';

	const totalLinks = ref<string>();
	const gitHash    = ref<string>('Source');
	const tweened    = reactive({ number: 0 });

	const { data } = useEventSource('/sse/shortlink_count', [], { withCredentials: true });

	const { GET } = createClient<paths>();

	const getLatestCommitHash = async () => {
		const { data } = await GET('/api/app_version');
		if (data) {
			gitHash.value = data.hash;
		}
	};

	onMounted(getLatestCommitHash);

	watch(data, d => totalLinks.value = d?.toString() ?? '∞');
	watch(totalLinks, n => gsap.to(tweened, { duration: 1.5, number: n || 0 }));
</script>

<template>
	<footer class="Footer">
		<div class="Footer-row" role="list">
			<div class="Footer-column" role="listitem">
				<span>Serving <span class="font-mono">{{ tweened.number.toLocaleString('en-us', { maximumFractionDigits: 0 }) }}</span> shortlinks</span>
			</div>
			<a href="/cli" target="_blank" class="Footer-link" role="listitem">
				<external-icon class="w-3 h-3"/>
				<span>CLI</span>
			</a>
			<a href="https://github.com/depthbomb/tetra" target="_blank" class="Footer-link" role="listitem">
				<github-icon class="w-3 h-3"/>
				<span>{{ gitHash }}</span>
			</a>
		</div>
	</footer>
</template>

<style scoped lang="scss">
	footer.Footer {
		@apply block;
		@apply py-6;
		// @apply border-t-2 border-gray-800;

		.Footer-row {
			@apply flex justify-center items-center;
			@apply gap-3;

			.Footer-column,
			.Footer-link {
				@apply flex justify-center items-center;
				@apply gap-1.5;
				@apply py-1 px-2.5;
				@apply max-h-7;
				@apply text-sm;
			}

			.Footer-link {
				@apply text-gray-400;
				@apply rounded;
				@apply transition-colors;
				@apply select-none;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-600;
			}
		}
	}
</style>
