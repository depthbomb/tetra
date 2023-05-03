<script setup lang="ts">
	import { ref } from 'vue';
	import { useApi } from '~/composables/useApi';
	import TimeAgo from '~/components/TimeAgo.vue';
	import AppButton from '~/components/AppButton.vue';
	import type { IAllShortlinksRecord } from '~/@types/IAllShortlinksRecord';
import { useTruncation } from '~/composables/useTruncation';

	const props = defineProps<{
		shortlink: IAllShortlinksRecord,
		shiftKey: boolean;
	}>();
	const emit = defineEmits(['shortlink-deleted', 'shortlink-disable-toggled']);

	const disabled = ref(props.shortlink.disabled);

	const { truncate } = useTruncation();

	const deleteShortlink = async (shortcode: string, secret: string) => {
		if (props.shiftKey === true || confirm('Are you sure you want to delete this shortlink?')) {
			const { success } = await useApi(`/api/v1/shortlinks/${shortcode}/${secret}`, { method: 'DELETE' });
			if (success.value) {
				emit('shortlink-deleted');
			}
		}
	};

	const toggleShortlinkDisabled = async (shortcode: string) => {
		if (props.shiftKey === true || confirm(`Are you sure you want to ${disabled.value ? 'enable' : 'disable'} this shortlink?`)) {

			const { success } = await useApi(`/api/admin/toggle-shortlink-disabled`, {
				body: JSON.stringify({ shortcode }),
				method: 'PATCH'
			});
			if (success.value) {
				disabled.value = !disabled.value;

				emit('shortlink-disable-toggled');
			}
		}
	};
</script>

<template>
	<tr :key="shortlink.shortcode">
		<td class="flex items-center space-x-1.5">
			<app-button variant="danger" size="small" @click.prevent="deleteShortlink(shortlink.shortcode, shortlink.secret)">Delete</app-button>
			<app-button :variant="disabled ? 'success' : 'warning'" size="small" @click.prevent="toggleShortlinkDisabled(shortlink.shortcode)">{{ disabled ? 'Enable' : 'Disable' }}</app-button>
		</td>
		<td>
			<p class="font-mono">{{ shortlink.shortcode }}</p>
		</td>
		<td>
			<p class="font-mono">
				<a :href="shortlink.destination" target="_blank">{{ truncate(shortlink.destination, 50) }}</a>
			</p>
		</td>
		<td>{{ shortlink.user_username ?? shortlink.creator_ip }}</td>
		<td><time-ago :date="shortlink.created_at"/></td>
		<td>{{ shortlink.expires_at ?? 'Never expires' }}</td>
	</tr>
</template>

<style scoped lang="scss">
	td {
		@apply p-3;
	}
</style>
