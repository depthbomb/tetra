<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { isValidHttpUrl } from '~/utils';
	import { useId } from '~/composables/useId';
	import { useApi } from '~/composables/useApi';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import PaperPlaneTopIcon from '~/components/icons/PaperPlaneTopIcon.vue';
	import { whenever, useClipboard, useMagicKeys, usePermission, useThrottleFn } from '@vueuse/core';
	import type { IApiErrorResponse } from '~/@types/IApiErrorResponse';
	import type { ICreateShortlinkResponse } from '~/@types/ICreateShortlinkResponse';

	const destination        = ref('');
	const shortcode          = ref('');
	const duration           = ref('');
	const submitting         = ref(false);
	const destinationFocused = ref(false);
	const shortlinkResult    = ref('');
	const isValid = computed(() => {
		if (!isValidHttpUrl(destination.value)) {
			return false;
		}

		if (shortcode.value !== '' && !/^[a-z0-9_-]{3,255}$/i.test(shortcode.value)) {
			return false;
		}

		return true;
	});

	const { generateId }      = useId();
	const user                = useUser();
	const { createToast }     = useToastStore();
	const { Ctrl_V }          = useMagicKeys();
	const { copy }            = useClipboard({ source: shortlinkResult });
	const clipboardReadAccess = usePermission('clipboard-read', { controls: true });

	const exampleShortcode = generateId().substring(7, 10);

	const readClipboardContent = async () => navigator?.clipboard.readText();
	// Throttle the "CTRL+V to submit" function to prevent any accidental submissions of shortlinks
	// that were just copied to the clipboard from a previous submission.
	const tryPasteSubmit = useThrottleFn(async () => {
		// So we don't try to submit if the user is pasting into the destination input when a valid
		// URL is already in there, for whatever reason.
		if (!destinationFocused.value) {
			destination.value = await readClipboardContent();

			await trySubmit(true);
		}
	}, 1_500);
	const trySubmit = async (fromPaste = false) => {
		if (!isValid.value) {
			if (fromPaste) {
				destination.value = '';
			}

			return;
		}

		submitting.value = true;

		let endpoint = '/api/v1/shortlinks';
		if (user.isLoggedIn) {
			endpoint = endpoint + '?api_key=' + user.apiKey;
		}

		const { success, getJSON } = await useApi(endpoint, {
			body: JSON.stringify({
				destination: destination.value,
				shortcode: shortcode.value,
				duration: duration.value,
			}),
			method: 'PUT'
		});

		if (success.value) {
			const data = await getJSON<ICreateShortlinkResponse>();

			shortlinkResult.value = data.shortlink;

			destination.value = '';
			shortcode.value   = '';
			duration.value    = '';

			copy();
			createToast('success', 'Shortlink copied to clipboard!');
		} else {
			const error = await getJSON<IApiErrorResponse>();
			createToast('error', error.message, true, 5_000);
		}

		submitting.value = false;
	};

	whenever(Ctrl_V, tryPasteSubmit);
</script>

<template>
	<div class="LinkCreator">
		<section class="LinkCreator-section">
			<div class="LinkCreator-sectionTitle">
				<h2>Destination</h2>
			</div>
			<input
				placeholder="http://website.tld"
				type="url"
				v-model.trim="destination"
				@focus="destinationFocused = true"
				@blur="destinationFocused = false">
		</section>

		<section class="LinkCreator-section">
			<div class="LinkCreator-sectionTitle">
				<h2>(Optional) Shortcode</h2>
				<p>3-255 characters, <code>a-z, 0-9, -, _</code> allowed</p>
			</div>
			<input :placeholder="`Ex: ${exampleShortcode}`" type="text" v-model.trim="shortcode">
		</section>

		<section class="LinkCreator-section">
			<div class="LinkCreator-sectionTitle">
				<h2>(Optional) Shortlink Duration</h2>
				<p>See <router-link :to="{ name: 'faq' }">FAQ</router-link> for more info</p>
			</div>
			<input placeholder="Ex: 1 hour 30 minutes" type="text" v-model.trim="duration">
		</section>

		<section class="pt-6 LinkCreator-section">
			<div class="col-span-6 flex items-center justify-between">
				<p v-if="clipboardReadAccess.state.value === 'granted'" class="LinkCreator-sectionHint">Hint: Press <span class="font-mono">CTRL+V</span> to instantly paste and submit!</p>
				<p v-else class="LinkCreator-sectionHint">Hint: Click <a href="#" @click.prevent="readClipboardContent">here</a> to give the site access to reading your clipboard so you can create links quicker.</p>
				<app-button :disabled="!isValid || submitting" @click="trySubmit">
					<span>Submit</span>
					<paper-plane-top-icon class="ml-2 w-4 h-4"/>
				</app-button>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.LinkCreator {
		@apply flex flex-col;
		@apply space-y-9;

		.LinkCreator-section {
			@apply grid grid-cols-6;

			.LinkCreator-sectionHint {
				@apply text-sm text-gray-400;
			}

			.LinkCreator-sectionTitle {
				@apply col-span-2;
				@apply flex flex-col;
				@apply space-y-3;

				h2 {
					@apply text-xl font-bold;
				}

				p {
					@apply text-sm;
				}
			}

			input {
				@apply col-span-4;
				@apply px-3;
				@apply w-full;
				@apply h-10;
				@apply bg-gray-700;
				@apply rounded-full;
				@apply shadow-inner;
				@apply ring-1 ring-inset ring-gray-500;
				@apply outline-none;
				@apply transition-all;

				@apply focus:ring-2 focus:ring-inset focus:ring-brand-600;
			}
		}
	}
</style>
