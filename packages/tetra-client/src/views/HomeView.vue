<script setup lang="ts">
	import { joinURL } from 'ufo';
	import { reactive } from 'vue';
	import { isValidHttpUrl } from '~/utils';
	import { useClipboard } from '@vueuse/core';
	import { makeApiRequest } from '~/services/api';
	import GlobalLayout from '~/layouts/GlobalLayout.vue';
	import LinkIcon from '~/components/icons/LinkIcon.vue';
	import HomeFooter from '~/components/home/HomeFooter.vue';
	import PaperPlaneTopIcon from '~/components/icons/PaperPlaneTopIcon.vue';
	import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';
	import type { ICreateLinkResponse } from '@tetra/common';

	const { copy } = useClipboard({ legacy: true });

	const uiState = reactive({
		valid: false,
		submitDisabled: true,
		destination: '',
		resultsDialogOpen: false,
		resultsDestination: ''
	});

	const validateInput = () => {
		uiState.valid          = isValidHttpUrl(uiState.destination);
		uiState.submitDisabled = !uiState.valid;
	};

	const trySubmit = async () => {
		uiState.submitDisabled = true;

		makeApiRequest<ICreateLinkResponse>('/api/links/create', {
			method: 'POST',
			body: JSON.stringify({ destination: uiState.destination })
		}).then(({ shortcode }) => {
			uiState.resultsDialogOpen  = true;
			uiState.resultsDestination = joinURL(window.location.origin, shortcode);
			copyDestinationToClipboard();
		}).catch(err => {
			// TODO handle
			console.error(err);
		});

		uiState.destination    = '';
		uiState.submitDisabled = false;
	};

	const copyDestinationToClipboard = () => copy(uiState.resultsDestination);
</script>

<template>
	<TransitionRoot appear :show="uiState.resultsDialogOpen" as="template">
		<Dialog as="div" @close="uiState.resultsDialogOpen = false" class="relative z-10">
			<TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black bg-opacity-25 backdrop-blur" />
			</TransitionChild>

			<div class="fixed inset-0 overflow-y-auto">
				<div class="flex min-h-full items-center justify-center p-4 text-center">
					<TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
						<DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
							<DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
								Shortlink Created!
							</DialogTitle>
							<div class="mt-2">
								<p class="text-sm text-gray-500">
									Your shortlink, <code>{{ uiState.resultsDestination }}</code>, has been copied to your clipboard!
								</p>
							</div>

							<div class="mt-4">
								<button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" @click="uiState.resultsDialogOpen = false">
									Sick, got it
								</button>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
	<GlobalLayout>
		<router-link :to="{ name: 'home' }" class="Header">go.super.fish</router-link>
		<div class="InputContainer">
			<LinkIcon class="w-9 text-gray-300"/>
			<input
				@input="validateInput"
				type="url"
				name="destination"
				:class="['Input', {
					'Input--invalid': !uiState.valid && uiState.destination !== '',
					'Input--valid': uiState.valid
				}]"
				autocomplete="off"
				autofocus
				v-model.trim="uiState.destination">
			<button
				@click="trySubmit"
				type="button"
				class="SubmitButton"
				role="button"
				:disabled="uiState.submitDisabled || uiState.destination === ''">
				<span>Submit</span>
				<PaperPlaneTopIcon class="inline-block ml-2 w-5"/>
			</button>
		</div>
		<HomeFooter/>
	</GlobalLayout>
</template>

<style scoped lang="scss">
	.Header {
		@apply block;
		@apply mb-6;
		@apply text-7xl text-white text-center;
		@apply font-serif;
		@apply drop-shadow;
	}

	.InputContainer {
		@apply flex flex-row items-center;
		@apply w-[720px];
		@apply py-3 px-4;
		@apply bg-white;
		@apply rounded-full;
		@apply shadow;

		.Input {
			@apply grow;
			@apply text-xl text-center font-bold;
			@apply overflow-ellipsis;
			@apply bg-transparent;
			@apply border-none;
			@apply outline-none;
			@apply ring-0 ring-offset-0;

			&.Input--valid {
				@apply text-green-500;
			}

			&.Input--invalid {
				@apply text-red-500;
			}
		}

		.SubmitButton {
			@apply shrink-0;
			@apply inline-block;
			@apply items-center;
			@apply ml-3;
			@apply py-3 px-4;
			@apply text-lg text-white;
			@apply bg-brand-500;
			@apply rounded-full;
			@apply shadow;
			@apply transition-all;

			@apply hover:text-white hover:bg-brand-400;
			@apply active:bg-brand-600;
			@apply focus:ring focus:ring-brand focus:ring-offset-2;
			@apply disabled:opacity-50 disabled:cursor-not-allowed;
		}
	}
</style>
