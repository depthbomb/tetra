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

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));
</script>

<template>
	<footer class="Footer">
		<div class="Footer-content">
			<p><copyright-icon class="mr-1.5"/> superfishial {{ new Date().getFullYear() }}</p>
			<span class="Footer-divider">|</span>
			<p><span>Serving <span class="font-mono">{{ tweened.number.toFixed(0) }}</span> shortlinks</span></p>
			<span class="Footer-divider">|</span>
			<a href="https://github.com/depthbomb/tetra" target="_blank"><github-icon class="mr-1.5"/> {{ gitHash }}</a>
			<span class="Footer-divider">|</span>
			<a href="https://unsplash.com/@jeremybishop" target="_blank" rel="nofollow">Background <external-icon class="ml-1.5"/></a>
		</div>
	</footer>
</template>

<style scoped lang="scss">
	.Footer {
		@apply flex justify-center flex-shrink-0;
		@apply py-3;

		.Footer-content {
			@apply flex;
			@apply space-x-3;

			p, a {
				@apply flex items-center;

				svg {
					@apply w-3 h-3;
				}
			}

			a {
				@apply text-brand-100;
				@apply border-b border-current;
				@apply hover:text-brand;
				@apply transition-colors;
			}

			.Footer-divider {
				@apply text-gray-300;
			}
		}
	}
</style>
