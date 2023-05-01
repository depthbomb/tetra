<script setup lang="ts">
	import gsap from 'gsap';
	import { useApi } from '~/composables/useApi';
	import { ref, watch, reactive, onMounted } from 'vue';
	import { useIntervalFn, useWindowFocus } from '@vueuse/core';
	import type { ITotalShortlinksResponse } from '~/@types/ITotalShortlinksResponse';

	const totalLinks = ref(0);
	const tweened    = reactive({ number: 0 });

	const focused = useWindowFocus();

	const getTotalLinksCount  = async () => {
		const { success, getJSON } = await useApi('/api/total-shortlinks', { method: 'POST' });
		if (success.value) {
			const { count }  = await getJSON<ITotalShortlinksResponse>();
			totalLinks.value = count;
		}
	};

	onMounted(getTotalLinksCount);

	useIntervalFn(async () => {
		if (focused.value) {
			await getTotalLinksCount();
		}
	}, 30_000);

	watch(totalLinks, n => gsap.to(tweened, { duration: 1.0, number: n || 0 }));
</script>

<template>
	<footer class="Footer">
		<div class="Footer-content">
			<p>&copy; superfishial {{ new Date().getFullYear() }}</p>
			<span class="Footer-divider">|</span>
			<p>Serving <span class="font-mono">{{ tweened.number.toFixed(0) }}</span> shortlinks</p>
			<span class="Footer-divider">|</span>
			<a href="https://github.com/depthbomb/tetra" target="_blank">Source</a>
			<span class="Footer-divider">|</span>
			<a href="https://unsplash.com/@jeremybishop" target="_blank" rel="nofollow">Background</a>
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

			a {
				@apply hover:text-brand;
				@apply transition-colors;
			}

			.Footer-divider {
				@apply text-gray-300;
			}
		}
	}
</style>
