<script lang="ts" setup>
import GithubIcon from '~/components/icons/GithubIcon.vue';
import ExternalIcon from '~/components/icons/ExternalIcon.vue';
</script>

<template>
	<footer class="Footer">
		<div class="Footer-row" role="list">
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
