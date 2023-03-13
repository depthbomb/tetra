<script setup lang="ts">
	import { onMounted } from 'vue';
	import { RouterView } from 'vue-router';
	import { useUserStore } from '~/stores/user';
	import { useIntervalFn } from '@vueuse/shared';
	import { makeApiRequest } from '~/services/api';
	import AppFooter from '~/components/AppFooter.vue';
	import AppMasthead from '~/components/AppMasthead.vue';
	import type { IAjaxMeResponse } from '~/@types/IAjaxMeResponse';

	const store = useUserStore();

	onMounted(() => {
		useIntervalFn(async () => {
			try {
				const res = await makeApiRequest<IAjaxMeResponse>('/ajax/me', { method: 'POST' });

				store.id       = res.sub      ?? null;
				store.username = res.username ?? null;
				store.avatar   = res.avatar   ?? null;
				store.apiKey   = res.apiKey   ?? null;
				store.admin    = res.admin    ?? false;

				// Log the user out if they are disabled
				if (res.disabled) {
					window.location.href = '/auth/logout';
				}
			} catch (err: unknown) {
				if (store.loggedIn) {
					alert('There was a problem authenticating you. Please log in again.');
					window.location.href = '/auth/logout';
				}
			}
		}, 60_000, { immediateCallback: true });
	});
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
