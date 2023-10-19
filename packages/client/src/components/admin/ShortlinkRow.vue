<script setup lang="ts">
	import { ref } from 'vue';
	import createClient from 'openapi-fetch';
	import TimeAgo from '~/components/TimeAgo.vue';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import type { paths, components } from '~/@types/openapi';

	const { shortlink, shiftKey } = defineProps<{
		shortlink: components['schemas']['ListAllShortlinksResponse'][number];
		shiftKey:  boolean;
	}>();
	const emit = defineEmits(['shortlink-deleted', 'shortlink-toggled']);

	const disabled       = ref<boolean>(shortlink.disabled);
	const deleteLoading  = ref<boolean>(false);
	const disableLoading = ref<boolean>(false);

	const { apiKey }      = useUser();
	const { truncate }    = useTruncation();
	const { createToast } = useToastStore();

	const { PATCH, DELETE } = createClient<paths>();

	const deleteShortlink = async (shortcode: string, secret: string) => {
		if (shiftKey === true || confirm('Are you sure you want to delete this shortlink?')) {
			const { error } = await DELETE('/api/v1/shortlinks/{shortcode}/{secret}', {
				params: {
					path: {
						shortcode,
						secret
					}
				}
			});

			if (error) {
				createToast('error', 'Failed to delete shortlink', true, true);
			} else {
				emit('shortlink-deleted');
			}
		}
	};

	const toggleShortlinkDisabled = async (shortcode: string) => {
		if (shiftKey === true || confirm(`Are you sure you want to ${disabled.value ? 'enable' : 'disable'} this shortlink?`)) {
			disableLoading.value = true;
			const { data, error } = await PATCH('/api/v1/shortlinks/{shortcode}/toggle', {
				params: {
					path: {
						shortcode
					},
					query: {
						apiKey
					}
				}
			});

			if (!data || error) {
				createToast('error', 'Failed to toggle shortlink state', true, true);
			} else {
				disabled.value = data.disabled;
				emit('shortlink-toggled');
			}

			disableLoading.value = false;
		}
	};
</script>

<template>
	<tr :key="shortlink.shortcode">
		<td class="flex items-center space-x-1.5">
			<app-button :loading="deleteLoading" :disabled="deleteLoading" variant="danger" size="small" @click.prevent="deleteShortlink(shortlink.shortcode, shortlink.secret)">Delete</app-button>
			<app-button :loading="disableLoading" :disabled="disableLoading" :variant="disabled ? 'success' : 'warning'" size="small" @click.prevent="toggleShortlinkDisabled(shortlink.shortcode)">{{ disabled ? 'Enable' : 'Disable' }}</app-button>
		</td>
		<td>
			<p class="font-mono">{{ shortlink.shortcode }}</p>
		</td>
		<td>
			<p class="font-mono">
				<a :href="shortlink.destination" target="_blank">{{ truncate(shortlink.destination, 50) }}</a>
			</p>
		</td>
		<td>{{ shortlink.user?.username ?? shortlink.creatorIp }}</td>
		<td><time-ago :date="shortlink.createdAt"/></td>
		<td>{{ shortlink.expiresAt ?? 'Never expires' }}</td>
	</tr>
</template>

<style scoped lang="scss">
	td {
		@apply p-3;
	}
</style>
