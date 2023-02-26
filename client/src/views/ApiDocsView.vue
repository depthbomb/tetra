<script setup lang="ts">
	import 'swagger-ui-dist/swagger-ui.css';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
import { onMounted } from 'vue';

	onMounted(() => SwaggerUIBundle({
		url: '/swagger/v1/swagger.json',
		dom_id: '#swagger'
	}))
</script>

<template>
	<div id="swagger"></div>
</template>
