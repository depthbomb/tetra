<script setup lang="ts">
	import { useUserStore } from '~/stores/user';
	import AppCard from '~/components/AppCard.vue';
	import AppHeading from '~/components/AppHeading.vue';

	const store = useUserStore();
</script>

<template>
	<div class="container">
		<app-heading>Your API Key</app-heading>
		<app-card>
			<p class="my-12 text-2xl text-center font-mono text-lime-500">{{ store.apiKey }}</p>
			<p>Creating shortlinks with an API key is only required if you want to be able to manage your shortlinks through this website. Otherwise, you do not need an API key and can choose to manage them through your own means with our API.</p>
		</app-card>
	</div>
</template>
