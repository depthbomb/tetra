<script setup lang="ts">
	import gsap from 'gsap';
	import createClient from 'openapi-fetch';
	import { ref, watch, reactive } from 'vue';
	import { useIntervalFn } from '@vueuse/core';
	import GithubIcon from '~/components/icons/GithubIcon.vue';
	import type { paths } from '~/@types/openapi';

	const totalLinks = ref<number>(0);
	const gitHash    = ref<string>('Source');
	const tweened    = reactive({ number: 0 });

	const { GET } = createClient<paths>();
	const getTotalLinksCount = async () => {
		const { data } = await GET('/api/v1/shortlinks/count');

		if (data) {
			totalLinks.value = data.count;
		}
	};

	// const getLatestCommitHash = async () => {
	// 	const { success, getJSON } = await useApi('/_private/git-hash', { method: 'POST' });
	// 	if (success.value) {
	// 		const { hash } = await getJSON<ILatestCommitHashResponse>();
	// 		gitHash.value  = hash;
	// 	}
	// };

	// onMounted(getLatestCommitHash);

	useIntervalFn(async () => await getTotalLinksCount(), 15_000, { immediateCallback: true });

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.5, number: n || 0 }));
</script>

<template>
	<footer class="Footer">
		<div class="Footer-row" role="list">
			<div class="Footer-column" role="listitem">
				<span>Serving <span class="font-mono">{{ tweened.number.toLocaleString('en-us', { maximumFractionDigits: 0 }) }}</span> shortlinks</span>
			</div>
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
		@apply mt-6 pt-6;
		@apply border-t-2 border-gray-800;

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
				@apply rounded-full;
				@apply transition-colors;
				@apply select-none;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-600;
			}
		}
	}
</style>
