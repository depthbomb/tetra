<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import AppFooter from '~/components/AppFooter.vue';
import AppHeader from '~/components/AppHeader.vue';
import AppToasts from '~/components/AppToasts.vue';

const route     = useRoute();
const isApiDocs = computed(() => route.meta.apiDocs === true);
</script>

<template>
	<app-toasts />
	<app-header />
	<div class="mx-auto" :class="isApiDocs ? 'pt-12 max-w-none' : 'pt-16 max-w-7xl'">
		<div class="MainCard" :class="{ 'is-full-width': isApiDocs }">
			<router-view />
		</div>
		<app-footer />
	</div>
</template>
