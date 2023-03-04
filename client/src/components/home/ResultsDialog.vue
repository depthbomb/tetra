<script setup lang="ts">
	import Snippet from '~/components/Snippet.vue';
	import ActionButton from '~/components/ActionButton.vue';
	import { Dialog as diag, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';

	const props = defineProps<{
		show: boolean;
		destination: string;
	}>();

	defineEmits(['closed']);
</script>

<template>
	<transition-root appear :show="props.show" as="template">
		<diag as="div" @close="$emit('closed')" class="relative z-10">
			<transition-child as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black bg-opacity-25 backdrop-blur" />
			</transition-child>

			<div class="fixed inset-0 overflow-y-auto">
				<div class="flex min-h-full items-center justify-center p-4 text-center">
					<transition-child as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
						<dialog-panel class="w-full max-w-md transform overflow-hidden rounded bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
							<dialog-title as="h3" class="text-lg font-medium leading-6 text-gray-50">
								Shortlink Created!
							</dialog-title>
							<div class="mt-2">
								<p class="text-sm text-gray-300">
									Your shortlink, <snippet>{{ destination }}</snippet>, has been copied to your clipboard!
								</p>
							</div>
							<div class="mt-4">
								<action-button @click="$emit('closed')" size="small">Sick, got it</action-button>
							</div>
						</dialog-panel>
					</transition-child>
				</div>
			</div>
		</diag>
	</transition-root>
</template>
