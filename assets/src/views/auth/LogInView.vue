<script setup lang="ts">
	import { onMounted } from 'vue';
	import AppLoader from '~/components/AppLoader.vue';

	onMounted(() => window.location.href = '/oidc/start');
</script>

<template>
	<app-loader text="Redirecting you to login&hellip;"/>
</template>
