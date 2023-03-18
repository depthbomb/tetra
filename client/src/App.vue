<script setup lang="ts">
	import { onMounted } from 'vue';
	import { RouterView } from 'vue-router';
	import { useUserStore } from '~/stores/user';
	import { useIntervalFn } from '@vueuse/shared';
	import { makeAPIRequest } from '~/services/api';
	import AppFooter from '~/components/AppFooter.vue';
	import AppMasthead from '~/components/AppMasthead.vue';
	import type { IAjaxMeResponse } from '~/@types/IAjaxMeResponse';

	const store = useUserStore();

	const alertSessionExpired = () => {
		alert('There was a problem authenticating you. Please log in again.');
		window.location.href = '/auth/logout';
	};

	onMounted(() => {
		useIntervalFn(async () => {
			try {
				const { ok, getJSON } = await makeAPIRequest<IAjaxMeResponse>('/ajax/me', { method: 'POST' });

				if (ok) {
					const user = await getJSON();

					store.username = user.username ?? null;
					store.avatar   = user.avatar   ?? null;
					store.admin    = user.admin    ?? false;

					// Log the user out if they are disabled
					if (user.disabled) {
						window.location.href = '/auth/logout';
					}
				} else {
					if (store.loggedIn) {
						alertSessionExpired();
					}
				}
			} catch (err: unknown) {
				alertSessionExpired();
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
