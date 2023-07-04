<script setup lang="ts">
	import gsap from 'gsap';
	import { useApi } from '~/composables/useApi';
	import { ref, watch, reactive, onMounted } from 'vue';
	import GithubIcon from '~/components/icons/GithubIcon.vue';
	import { useIntervalFn, useWindowFocus } from '@vueuse/core';
	import ExternalIcon from '~/components/icons/ExternalIcon.vue';
	import CopyrightIcon from '~/components/icons/CopyrightIcon.vue';
	import type { ITotalShortlinksResponse } from '~/@types/ITotalShortlinksResponse';
	import type { ILatestCommitHashResponse } from '~/@types/ILatestCommitHashResponse';

	const totalLinks = ref<number>(0);
	const gitHash    = ref<string>('Source');
	const tweened    = reactive({ number: 0 });

	const focused = useWindowFocus();

	const getTotalLinksCount = async () => {
		const { success, getJSON } = await useApi('/_private/total-shortlinks', { method: 'POST' });
		if (success.value) {
			const { count }  = await getJSON<ITotalShortlinksResponse>();
			totalLinks.value = count;
		}
	};

	const getLatestCommitHash = async () => {
		const { success, getJSON } = await useApi('/_private/git-hash', { method: 'POST' });
		if (success.value) {
			const { hash } = await getJSON<ILatestCommitHashResponse>();
			gitHash.value  = hash;
		}
	};

	onMounted(getTotalLinksCount);
	onMounted(getLatestCommitHash);

	useIntervalFn(async () => {
		if (focused.value) {
			await getTotalLinksCount();
		}
	}, 10_000);

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.5, number: n || 0 }));
</script>

<template>
	<footer class="Footer">
		<div class="Footer-row" role="list">
			<div class="Footer-column" role="listitem">
				<copyright-icon class="w-3 h-3"/>
				<span>superfishial {{ new Date().getFullYear() }}</span>
			</div>
			<div class="Footer-column" role="listitem">
				<span>Serving <span class="font-mono">{{ tweened.number.toLocaleString('en-us', { maximumFractionDigits: 0 }) }}</span> shortlinks</span>
			</div>
			<a href="https://github.com/depthbomb/tetra" target="_blank" class="Footer-link" role="listitem">
				<github-icon class="w-3 h-3"/>
				<span>{{ gitHash }}</span>
			</a>
			<a href="https://unsplash.com/@jeremybishop" target="_blank" class="Footer-link" role="listitem">
				<span>Background</span>
				<external-icon class="ml-1.5 w-3 h-3"/>
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
