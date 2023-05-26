<script setup lang="ts">
	import type { IBaseSchema } from './IBaseSchema';

	defineProps<{
		name: string;
		data: Array<IBaseSchema & { nullable?: boolean; }>;
	}>();
</script>

<template>
	<div class="Endpoint-schema">
		<header class="Endpoint-schemaHeader">
			<h2>{{ name }}</h2>
		</header>
		<table class="Endpoint-schemaTable">
			<thead>
				<tr>
					<th>Property</th>
					<th>Type</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr :key="property.name" v-for="property in data">
					<td class="font-mono">{{ property.nullable ? '?' : '' }}{{ property.name }}</td>
					<td>{{ property.type }}</td>
					<td>
						<p>{{ property.description }}</p>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped lang="scss">
	.Endpoint-schema {
		@apply bg-gray-800;
		@apply rounded-2xl;
		@apply overflow-hidden;

		.Endpoint-schemaHeader {
			@apply flex items-center;
			@apply space-x-3;
			@apply p-3;
			@apply border-b border-gray-700;
		}

		.Endpoint-schemaTable {
			@apply w-full;
			@apply table table-auto;

			thead tr th {
				@apply p-3;
				@apply text-left;
			}

			tbody tr td {
				@apply p-3;
			}
		}
	}
</style>
