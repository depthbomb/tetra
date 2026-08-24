<script lang="ts" setup>
import '@scalar/api-reference/style.css';
import { ApiReference } from '@scalar/api-reference';
import type { ApiReferenceConfiguration } from '@scalar/api-reference';

const configuration = {
	url: '/openapi.json',
	darkMode: true,
	hideClientButton: true,
	layout: 'modern',
	showSidebar: true,
	theme: 'bluePlanet',
} satisfies Partial<ApiReferenceConfiguration>;
</script>

<template>
	<div class="ApiDocs">
		<api-reference :configuration="configuration" />
	</div>
</template>

<style scoped>
.ApiDocs {
	min-height: calc(100vh - 4rem);
}
</style>
