<script setup lang="ts">
	import { RouterView } from 'vue-router';
	import AppFooter from './components/AppFooter.vue';
	import AppMasthead from './components/AppMasthead.vue';
</script>

<template>
	<div class="app-wrapper">
		<app-masthead/>
		<div class="content">
			<router-view/>
		</div>
		<app-footer/>
	</div>
</template>

<style scoped lang="scss">
	.app-wrapper {
		@apply flex flex-col;
		@apply h-screen;

		.content {
			@apply flex-grow;
		}
	}
</style>
