<script setup lang="ts">
	import { reactive } from 'vue';
	import { isValidHttpUrl } from '~/utils';
	import { useClipboard } from '@vueuse/core';
	import { useTetraStore } from '~/stores/tetra';
	import { makeApiRequest } from '~/services/api';
	import ActionButton from '~/components/ActionButton.vue';
	import ResultsDialog from '~/components/home/ResultsDialog.vue';
	import PaperPlaneTopIcon from '~/components/icons/PaperPlaneTopIcon.vue';
	import type { ICreateLinkResponse } from '~/@types/ICreateLinkResponse';

	const emit = defineEmits(['linkCreated']);

	const { copy } = useClipboard({ legacy: true });

	const store   = useTetraStore();
	const uiState = reactive({
		valid: false,
		submitDisabled: true,
		destination: '',
		duration: '',
		resultsDialogOpen: false,
		resultsDestination: ''
	});

	const validateInput = () => {
		console.log('validating');
		console.log(uiState.destination);
		uiState.valid          = isValidHttpUrl(uiState.destination);
		uiState.submitDisabled = !uiState.valid;
	};
	const trySubmit = async () => {
		uiState.submitDisabled = true;

		makeApiRequest<ICreateLinkResponse>('/api/links/create', {
			method: 'POST',
			body: JSON.stringify({ destination: uiState.destination })
		}).then((link) => {
			const { shortlink } = link;

			// Only show the results dialog for unauthenticated users since authenticated users
			// will already see feedback upon shortlink creation.
			if (!store.loggedIn) {
				uiState.resultsDialogOpen  = true;
				uiState.resultsDestination = shortlink;
			}
			copyDestinationToClipboard();
			emit('linkCreated');
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
	<results-dialog
		@closed="uiState.resultsDialogOpen = false"
		:show="uiState.resultsDialogOpen"
		:destination="uiState.resultsDestination"
	/>

	<div class="destination-input">
		<input
			@input="validateInput"
			type="url"
			placeholder="Enter your destination here"
			:class="['--block --large', {
				'--success': uiState.valid,
				'--error': !uiState.valid && uiState.destination !== ''
			}]"
			v-model.trim="uiState.destination"
		/>
		<action-button @click="trySubmit" size="large" :disabled="uiState.submitDisabled || uiState.destination === ''">
			<span>Submit</span>
			<paper-plane-top-icon class="ml-2 h-4"/>
		</action-button>
	</div>
</template>

<style scoped lang="scss">
	.destination-input {
		@apply flex flex-row items-center;
		@apply space-x-2;
	}

	.options-toggle {
		@apply my-4 mx-auto;
		@apply flex flex-row items-center justify-center;
		@apply space-x-3;
		@apply text-white text-lg;
	}
</style>
