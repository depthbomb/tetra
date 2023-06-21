<script setup lang="ts">
	import CheckIcon from '~/components/icons/CheckIcon.vue';
	import CloseIcon from '~/components/icons/CloseIcon.vue';
	import ArrowLongIcon from '~/components/icons/ArrowLongIcon.vue';
	import type { IBaseSchema } from './IBaseSchema';

	type RequestSchema = IBaseSchema & {
		required?: boolean;
	};

	type ResponseSchema = IBaseSchema & {
		nullable?: boolean;
	};

	defineProps<{
		type: 'request';
		data: Array<RequestSchema>;
	} | {
		type: 'response';
		data: Array<ResponseSchema>;
	}>();
</script>

<template>
	<div class="Endpoint-data">
		<header class="Endpoint-dataHeader">
			<arrow-long-icon v-if="type === 'response'" direction="left" class="w-6 h-6"/>
			<h2>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</h2>
			<arrow-long-icon v-if="type === 'request'" direction="right" class="w-6 h-6"/>
		</header>
		<table class="Endpoint-dataTable">
			<template v-if="type === 'request'"> <!-- REQUEST DATA -->
				<thead>
					<tr>
						<th>Property</th>
						<th>Type</th>
						<th>Description</th>
						<th class="!text-center">Required</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="property.name" v-for="property in data">
						<td class="font-mono">{{ property.name }}</td>
						<td>{{ property.type }}</td>
						<td>
							<p>{{ property.description }}</p>
						</td>
						<td>
							<check-icon v-if="property.required" class="mx-auto w-6 h-6 text-green-500"/>
							<close-icon v-else class="mx-auto w-6 h-6 text-red-500"/>
						</td>
					</tr>
				</tbody>
			</template>
			<template v-else> <!-- RESPONSE DATA -->
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
			</template>
		</table>
	</div>
</template>

<style scoped lang="scss">
	.Endpoint-data {
		@apply bg-gray-800;
		@apply rounded;
		@apply overflow-hidden;

		& + & {
			@apply mt-6;
		}

		.Endpoint-dataHeader {
			@apply flex items-center;
			@apply space-x-3;
			@apply p-3;
			@apply border-b border-gray-700;
		}

		.Endpoint-dataTable {
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
