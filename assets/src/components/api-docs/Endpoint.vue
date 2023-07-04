<script setup lang="ts">
	import { Disclosure, DisclosurePanel, DisclosureButton } from '@headlessui/vue';

	defineProps<{
		verb: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
		url: string;
		description?: string;
		deprecated?: boolean;
	}>();
</script>

<template>
	<disclosure as="div" :class="['Endpoint', { 'is-deprecated': deprecated }]">
		<disclosure-button class="Endpoint-http">
			<div :class="['Endpoint-verb', {
				'is-get': verb === 'GET',
				'is-put': verb === 'PUT',
				'is-post': verb === 'POST',
				'is-patch': verb === 'PATCH',
				'is-delete': verb === 'DELETE',
			}]">{{ verb }}</div>
			<span class="Endpoint-url">{{ url }}</span>
			<p v-if="description" class="Endpoint-description">{{ description }}</p>
		</disclosure-button>
		<transition
			enter-active-class="transition duration-100 ease-out"
			enter-from-class="transform scale-95 opacity-0"
			enter-to-class="transform scale-100 opacity-100"
			leave-active-class="transition duration-75 ease-out"
			leave-from-class="transform scale-100 opacity-100"
			leave-to-class="transform scale-95 opacity-0">
			<disclosure-panel>
				<p v-if="deprecated" class="Endpoint-deprecationWarning">
					<span><strong>Warning:</strong> This endpoint is deprecated</span>
				</p>
				<div class="Endpoint-explanation">
					<slot/>
				</div>
			</disclosure-panel>
		</transition>
	</disclosure>
</template>

<style scoped lang="scss">
	.Endpoint {
		@apply p-1.5;
		@apply w-full;
		@apply bg-gray-950;
		@apply rounded-3xl;

		& + & {
			@apply mt-3;
		}

		&.is-deprecated .Endpoint-http {
			@apply grayscale;

			.Endpoint-url {
				@apply line-through;
			}
		}

		.Endpoint-http {
			@apply flex items-center;
			@apply w-full;

			.Endpoint-verb {
				@apply py-1.5 px-6;
				@apply font-mono font-bold;
				@apply rounded-full;
				@apply border;

				&.is-get {
					@apply text-blue-400;
					@apply bg-blue-950;
					@apply border-blue-600;
				}

				&.is-put {
					@apply text-orange-400;
					@apply bg-orange-950;
					@apply border-orange-600;
				}

				&.is-post {
					@apply text-green-400;
					@apply bg-green-950;
					@apply border-green-600;
				}

				&.is-patch {
					@apply text-cyan-400;
					@apply bg-cyan-950;
					@apply border-cyan-600;
				}

				&.is-delete {
					@apply text-red-400;
					@apply bg-red-950;
					@apply border-red-600;
				}
			}

			.Endpoint-url {
				@apply ml-3;
				@apply font-mono text-lg;
			}

			.Endpoint-description {
				@apply ml-auto mr-3;
				@apply text-gray-500;
			}
		}

		.Endpoint-deprecationWarning {
			@apply mt-3 ml-3;
			@apply py-1 px-3;
			@apply inline-block;
			@apply font-mono text-sm text-yellow-600;
			@apply bg-yellow-950;
			@apply border border-yellow-600;
			@apply rounded-full;
		}

		.Endpoint-explanation {
			@apply mt-3;
			@apply py-3 px-6;
		}
	}
</style>
