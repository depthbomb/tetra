<script setup lang="ts">
	import { RouterView } from 'vue-router';
	import AppToasts from '~/components/AppToasts.vue';
	import AppHeader from '~/components/AppHeader.vue';
	import AppFooter from '~/components/AppFooter.vue';
</script>

<template>
	<app-toasts/>
	<app-header/>
	<div class="mx-auto pt-16 max-w-screen-xl">
		<div class="MainCard">
			<router-view/>
		</div>
		<app-footer/>
	</div>
</template>
