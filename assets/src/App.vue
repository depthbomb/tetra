<script setup lang="ts">
	import { RouterView } from 'vue-router';
	import AppToasts from '~/components/AppToasts.vue';
	import AppHeader from '~/components/AppHeader.vue';
	import AppFooter from '~/components/AppFooter.vue';
</script>

<template>
	<app-toasts/>
	<app-header/>
	<div class="Container">
		<div class="MainCard">
			<router-view/>
		</div>
		<app-footer/>
	</div>
</template>

<style scoped lang="scss">
	.Container {
		@apply mx-auto;
		@apply pt-16;
		@apply max-w-screen-xl;
	}
</style>
