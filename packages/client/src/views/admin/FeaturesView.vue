<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import createClient from 'openapi-fetch';
	import { useUserStore } from '~/stores/user';
	import { useToastStore } from '~/stores/toast';
	import AppLoader from '~/components/AppLoader.vue';
	import AppButton from '~/components/AppButton.vue';
	import type { paths, components } from '~/@types/openapi';

	const loading  = ref<boolean>(true);
	const features = ref<components['schemas']['ListFeaturesResponse']>([]);

	const { apiKey }      = useUserStore();
	const { createToast } = useToastStore();

	const { GET, PATCH } = createClient<paths>();

	const getFeatureDescription = (name: string) => {
		switch (name) {
			case 'SHORTLINK_CREATION':
				return 'Whether new shortlinks can be created';
			case 'SHORTLINK_REDIRECTION':
				return 'Whether shortlinks should redirect to their destination';
			case 'SHORTLINK_CLEANUP':
				return 'Whether the cleanup task should run to delete expired shortlinks';
			case 'AUTHENTICATION':
				return 'Whether authentication and new user creation is enabled';
			case 'HTML_MINIFICATION':
				return 'Whether rendered HTML should be minified';
			case 'PRETTY_PRINT_JSON':
				return 'Whether JSON responses should be "pretty printed"';
			default:
				return 'Unknown';
		}
	}

	const getAllFeatures = async () => {
		const { data, error } = await GET('/api/v1/features', {
			params: {
				query: {
					apiKey
				}
			}
		});

		if (!data || error) {
			createToast('error', 'Failed to retrieve features.', false, 3_000);
		} else {
			features.value = data;
		}

		loading.value = false;
	};

	const toggleFeature = async (name: string) => {
		const { data, error } = await PATCH('/api/v1/features/{name}/toggle', {
			params: {
				path: {
					name
				},
				query: {
					apiKey
				}
			}
		});

		if (!data || error) {
			createToast('error', `Failed to toggle ${name} feature.`, false, 3_000);
		} else {
			await getAllFeatures();
		}
	};

	onMounted(getAllFeatures);
</script>

<template>
	<p>This page allows you toggle various features of the service. Features are hardcoded into the application and thus cannot be created or deleted either remotely or from the client.</p>
	<div class="MainCard-divider"/>
	<app-loader v-if="loading"/>
	<table v-else class="w-full table-auto" role="table">
		<thead>
			<tr class="py-3 h-8 text-left">
				<th>Name</th>
				<th>Description</th>
				<th>Enabled</th>
				<th>Controls</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="feature in features">
				<td>{{ feature.name }}</td>
				<td>{{ getFeatureDescription(feature.name) }}</td>
				<td><code>{{ feature.enabled }}</code></td>
				<td>
					<app-button :variant="feature.enabled ? 'danger' : 'success'" size="xsmall" @click="toggleFeature(feature.name)">
						{{ feature.enabled ? 'Disable' : 'Enable' }}
					</app-button>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped lang="scss">

</style>
