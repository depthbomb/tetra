<script setup lang="ts">
	import { reactive } from 'vue';
	import { isValidHttpUrl } from '~/utils';
	import { useClipboard } from '@vueuse/core';
	import { makeApiRequest } from '~/services/api';
	import type { ICreateLinkResponse } from '@tetra/common';

	const { copy } = useClipboard({ legacy: true });

	const state = reactive({
		valid: false,
		submitDisabled: true,
		destination: '',
		error: ''
	});

	const dialogState = reactive({
		open: false,
		shortlink: ''
	});

	const validateInput = () => {
		state.valid          = isValidHttpUrl(state.destination);
		state.submitDisabled = !state.valid;
	};

	const copyShortlinkToClipboard = () => {
		copy(dialogState.shortlink);
		dialogState.open = false;
	};

	const trySubmit = async () => {
		state.error          = '';
		state.submitDisabled = true;

		dialogState.shortlink = '';
		dialogState.open      = false;

		makeApiRequest<ICreateLinkResponse>('api:links:create', {
			headers: { 'X-Api-Version': '1' },
			body: JSON.stringify({ destination: state.destination })
		}).then(({ shortcode }) => {
			state.destination = '';

			dialogState.shortlink = `https://go.super.fish/${shortcode}`;
			dialogState.open      = true;
		}).catch(err => {
			state.error = `Error: ${err.message}`;
		});

		state.submitDisabled = false;
	};
</script>

<template>
	<v-card class="w-50">
		<v-card-text>
			<v-text-field
				@input="validateInput"
				type="url"
				clearable
				autofocus
				autocomplete="off"
				placeholder="https://website.tld"
				prepend-inner-icon="mdi-link"
				variant="outlined"
				:error="!state.valid && state.destination !== ''"
				:error-messages="state.error"
				v-model.trim="state.destination"
			/>

			<v-btn
				@click="trySubmit"
				block
				size="large"
				color="blue"
				append-icon="mdi-send"
				:disabled="state.submitDisabled || state.destination === ''"
			>Submit</v-btn>
		</v-card-text>
	</v-card>
	<v-dialog v-model="dialogState.open">
		<v-container>
			<v-card class="mx-auto w-50">
				<v-card-text class="text-center">
					<span @click="copyShortlinkToClipboard" class="text-lg-h4 text-green cursor-pointer">
						{{ dialogState.shortlink }}
						<v-tooltip activator="parent" location="top">Click to copy</v-tooltip>
					</span>
				</v-card-text>
			</v-card>
		</v-container>
	</v-dialog>
</template>
