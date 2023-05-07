<script setup lang="ts">
	import { RouterView } from 'vue-router';
	import AppToasts from './components/AppToasts.vue';
	import AppHeader from '~/components/AppHeader.vue';
	import AppFooter from '~/components/AppFooter.vue';
</script>

<template>
	<app-toasts/>
	<div class="Container">
		<app-header/>
		<div class="MainCard">
			<router-view/>
		</div>
		<app-footer/>
	</div>
	<div class="BackgroundImage"></div>
</template>

<style scoped lang="scss">
	.Container {
		@apply mx-auto;
		@apply w-[1280px];
	}

	.BackgroundImage {
		@apply absolute;
		@apply inset-0;
		@apply w-full h-full;
		@apply bg-cover bg-center bg-fixed bg-[url(/assets/img/backgrounds/bg2.webp)];
		mask-image: linear-gradient(to bottom, rgba(0,0,0,1), transparent);
		@apply opacity-90;
		@apply -z-10;
	}
</style>
