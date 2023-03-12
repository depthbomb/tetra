<script setup lang="ts">
	import 'swagger-ui-dist/swagger-ui.css';
	import { onMounted } from 'vue';
	import { SwaggerUIBundle } from 'swagger-ui-dist';

	onMounted(() => SwaggerUIBundle({
		url: '/swagger/v1/swagger.json',
		dom_id: '#swagger'
	}));
</script>

<template>
	<div id="swagger"></div>
</template>

<style scoped lang="scss">
	#swagger {
		@apply bg-white;
		@apply overflow-auto;
	}
</style>
