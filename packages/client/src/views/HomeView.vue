<script setup lang="ts">
	import createClient from 'openapi-fetch';
	import { isValidHttpUrl } from '~/utils';
	import { Shortcode } from '@tetra/schema';
	import { useId } from '~/composables/useId';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import KeyCombo from '~/components/KeyCombo.vue';
	import AppButton from '~/components/AppButton.vue';
	import { useFeatures } from '~/composables/useFeature';
	import { ref, computed, defineAsyncComponent } from 'vue';
	import PaperPlaneTopIcon from '~/components/icons/PaperPlaneTopIcon.vue';
	import { whenever, useClipboard, useMagicKeys, usePermission, useThrottleFn } from '@vueuse/core';
	import type { paths } from '~/@types/openapi';

	const WarningIcon = defineAsyncComponent(() => import('~/components/icons/WarningIcon.vue'));

	const destination        = ref<string>('');
	const shortcode          = ref<string | undefined>();
	const duration           = ref<string | undefined>();
	const submitting         = ref<boolean>(false);
	const destinationFocused = ref<boolean>(false);
	const shortlinkResult    = ref<string>('');
	const isValid = computed(() => {
		if (!isValidHttpUrl(destination.value)) {
			return false;
		}

		if (shortcode.value) {
			return Shortcode.safeParse(shortcode.value).success;
		}

		return true;
	});

	const { generateId }       = useId();
	const { isFeatureEnabled } = useFeatures();
	const user                 = useUser();
	const { createToast }      = useToastStore();
	const { Ctrl_V }           = useMagicKeys();
	const { copy }             = useClipboard({ source: shortlinkResult });
	const clipboardReadAccess  = usePermission('clipboard-read', { controls: true });

	const creationDisabled = ref(!isFeatureEnabled('SHORTLINK_CREATION'));

	const exampleShortcode = generateId().substring(7, 10);
	const { PUT }          = createClient<paths>();

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

		const { data, error } = await PUT('/api/v1/shortlinks', {
			body: {
				destination: destination.value,
				shortcode: shortcode.value,
				duration: duration.value
			},
			params: {
				query: {
					apiKey: user.isLoggedIn ? user.apiKey : undefined
				}
			}
		});

		if (error) {
			createToast('error', error.message, true, true, 5_000);
		} else {
			shortlinkResult.value = data.shortlink;

			destination.value = '';
			shortcode.value   = undefined;
			duration.value    = undefined;

			copy();
			createToast('success', 'Shortlink copied to clipboard!');
		}

		submitting.value = false;
	};

	whenever(() => Ctrl_V.value && !creationDisabled.value, tryPasteSubmit);
</script>

<template>
	<div class="LinkCreator">
		<div v-if="creationDisabled" class="LinkCreator-featureDisabledOverlay">
			<warning-icon/>
			<p>Shortlink creation is currently disabled. Please try again later.</p>
		</div>

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
				<h2>Shortcode <span>(optional)</span></h2>
				<p>3-64 characters, <code>a-z, 0-9, -, _</code> allowed</p>
			</div>
			<input :placeholder="`Ex: ${exampleShortcode}`" type="text" v-model.trim="shortcode">
		</section>

		<section class="LinkCreator-section">
			<div class="LinkCreator-sectionTitle">
				<h2>Shortlink Duration <span>(optional)</span></h2>
				<p>See <router-link :to="{ name: 'faq' }">FAQ</router-link> for more info</p>
			</div>
			<input placeholder="Ex: 1 hour 30 minutes" type="text" v-model.trim="duration">
		</section>

		<section class="pt-6 LinkCreator-section">
			<div class="col-span-6 flex items-center justify-between">
				<p v-if="clipboardReadAccess.state.value === 'granted'" class="LinkCreator-sectionHint">Hint: Press <key-combo :keys="['ctrl', 'v']"/> to instantly paste and submit!</p>
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

		.LinkCreator-featureDisabledOverlay {
			@apply absolute;
			@apply inset-0;
			@apply flex flex-col items-center justify-center;
			@apply space-y-3;
			@apply w-full h-full;
			@apply bg-red-950 bg-opacity-50;
			@apply backdrop-blur;
			@apply z-10;

			svg {
				@apply w-16 h-16;
				@apply text-red-600;
			}

			p {
				@apply text-white text-lg font-mono;
			}
		}

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

					span {
						@apply text-sm font-normal text-gray-400 align-super;
					}
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
