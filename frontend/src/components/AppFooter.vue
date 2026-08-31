<script lang="ts" setup>
import gsap from 'gsap';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import ExternalIcon from '~/components/icons/ExternalIcon.vue';
import { ref, watch, reactive, onMounted, onUnmounted } from 'vue';
import type { Maybe, Nullable } from '@depthbomb/common/typing';

type ShortlinkCount = {
	count: number;
};

const shortlinkCount = ref<Nullable<number>>(null);
const tweenedCount   = reactive({ value: 0 });

let countSource: Maybe<EventSource>;

function updateShortlinkCount(event: MessageEvent<string>): void {
	try {
		const payload = JSON.parse(event.data);
		if (typeof payload !== 'object' || payload === null) {
			return;
		}

		const { count } = payload as Partial<ShortlinkCount>;
		if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
			return;
		}

		shortlinkCount.value = count;
	} catch {
		// Ignore malformed events and retain the last valid count.
	}
}

watch(shortlinkCount, count => {
	if (count === null) {
		return;
	}

	gsap.to(tweenedCount, { duration: 1.5, overwrite: true, value: count });
});

onMounted(() => {
	countSource = new EventSource('/sse');
	countSource.addEventListener('shortlink-count', updateShortlinkCount);
});

onUnmounted(() => {
	gsap.killTweensOf(tweenedCount);
	countSource?.close();
});
</script>

<template>
	<footer class="Footer">
		<div class="Footer-row" role="list">
			<div class="Footer-column" role="listitem">
				<span>Serving <span class="font-mono">{{ tweenedCount.value.toLocaleString('en-US', { maximumFractionDigits: 0 }) }}</span> shortlinks</span>
			</div>
			<a class="Footer-link" href="/cli" role="listitem" target="_blank">
				<external-icon class="w-3 h-3" />
				<span>CLI</span>
			</a>
			<a class="Footer-link" href="https://github.com/depthbomb/tetra" role="listitem" target="_blank">
				<github-icon class="w-3 h-3" />
				<span>Source</span>
			</a>
			<span class="Footer-column" role="listitem">
				<span class="text-gray-600">&copy; 2023-2026 Superfishial</span>
			</span>
		</div>
	</footer>
</template>

<style scoped>
@reference "~/assets/css/app.css";

footer.Footer {
	@apply block;
	@apply py-6;

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
