<script setup lang="ts">
	import { reactive } from 'vue';
	import { isValidHttpUrl } from '~/utils';
	import { useClipboard } from '@vueuse/core';
	import { useUserStore } from '~/stores/user';
	import { makeAPIRequest } from '~/services/api';
	import ActionButton from '~/components/ActionButton.vue';
	import ResultsDialog from '~/components/home/ResultsDialog.vue';
	import PaperPlaneTopIcon from '~/components/icons/PaperPlaneTopIcon.vue';
	import type { ICreateLinkResponse } from '~/@types/ICreateLinkResponse';

	const emit = defineEmits(['linkCreated']);

	const { copy } = useClipboard({ legacy: true });

	const store   = useUserStore();
	const uiState = reactive({
		valid: false,
		submitDisabled: true,
		destination: '',
		duration: '',
		resultsDialogOpen: false,
		resultsDestination: ''
	});

	const validateInput = () => {
		uiState.valid          = isValidHttpUrl(uiState.destination);
		uiState.submitDisabled = !uiState.valid;
	};
	const trySubmit = async () => {
		uiState.submitDisabled = true;

		const { ok, getJSON } = await makeAPIRequest<ICreateLinkResponse>('/api/links', {
			method: 'PUT',
			body: JSON.stringify({ destination: uiState.destination })
		});

		if (ok) {
			const { shortlink } = await getJSON();

			// Only show the results dialog for unauthenticated users since authenticated users will
			// already see feedback upon shortlink creation.
			if (!store.loggedIn) {
				uiState.resultsDialogOpen  = true;
				uiState.resultsDestination = shortlink;

				copyDestinationToClipboard();
			}

			emit('linkCreated');
		}

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
			placeholder="Your long URL"
			:class="['--block --large', {
				'--success': uiState.valid,
				'--error': !uiState.valid && uiState.destination !== ''
			}]"
			v-model.trim="uiState.destination"
		/>
		<action-button @click="trySubmit" size="large" :disabled="uiState.submitDisabled || uiState.destination === ''">
			<span>Submit</span>
			<paper-plane-top-icon class="ml-2 h-5"/>
		</action-button>
	</div>
</template>

<style scoped lang="scss">
	.destination-input {
		@apply flex flex-row items-center;
		@apply space-x-2;
	}
</style>
