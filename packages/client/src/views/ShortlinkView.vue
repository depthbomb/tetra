<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useImage } from '@vueuse/core';
	import createClient from 'openapi-fetch';
	import TimeAgo from '~/components/TimeAgo.vue';
	import { useRouteParams } from '@vueuse/router';
	import AppLoader from '~/components/AppLoader.vue';
	import WarningIcon from '~/components/icons/WarningIcon.vue';
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';
	import type { paths } from '~/@types/openapi';

	const loaded       = ref<boolean>(false);
	const error        = ref<boolean>(false);
	const errorMessage = ref<string>('');
	const qrCodeUrl    = ref<string>('');
	const shortlink    = ref<string>('');
	const destination  = ref<string>('');
	const createdAt    = ref<string>('');
	const expiresAt    = ref<string | null>('');

	const shortcode     = useRouteParams<string>('shortcode');
	const { isLoading } = useImage({ src: qrCodeUrl.value });

	const { GET } = createClient<paths>();

	const getShortlinkInfo = async () => {

		const { data, error: err } = await GET('/api/v1/shortlinks/{shortcode}', {
			params: {
				path: {
					shortcode: shortcode.value
				}
			}
		});

		if (err) {
			error.value = true;
			errorMessage.value = 'That shortlink doesn\'t appear to exist.';
		} else {
			shortlink.value   = data.shortlink;
			destination.value = data.destination;
			createdAt.value   = data.createdAt;
			expiresAt.value   = data.expiresAt ?? null;

			qrCodeUrl.value = `/api/v1/shortlinks/${shortcode.value}/qrcode.svg`;
		}

		loaded.value = true;
	}

	onMounted(getShortlinkInfo);
</script>

<template>
	<div v-if="loaded" class="Shortlink">
		<div v-if="error" class="Shortlink-error">
			<warning-icon class="w-6 h-6"/>
			<p>{{ errorMessage }}</p>
		</div>
		<template v-else>
			<div class="Shortlink-qrCode">
				<div v-if="isLoading" class="Shortlink-qrCodeLoader">
					<spinner-icon class="animate-spin w-6 h-6"/>
				</div>
				<img :src="qrCodeUrl" width="272" height="272" :alt="shortlink">
			</div>

			<div class="Shortlink-info">
				<section class="Shortlink-infoSection">
					<h2>Shortlink</h2>
					<p class="font-mono">
						<a :href="shortlink" target="_blank">{{ shortlink }}</a>
					</p>
				</section>
				<section class="Shortlink-infoSection">
					<h2>Destination</h2>
					<p class="font-mono">
						<a :href="destination" target="_blank" rel="nofollow">{{ destination }}</a>
					</p>
				</section>

				<section class="Shortlink-infoSection">
					<h2>Created</h2>
					<p>
						<time-ago :date="createdAt" :toggleable="true" :inverse="true"/>
					</p>
				</section>

				<section v-if="expiresAt" class="Shortlink-infoSection">
					<h2>Expires</h2>
					<p>
						<time-ago :date="expiresAt" :toggleable="true"/>
					</p>
				</section>
			</div>
		</template>
	</div>
	<app-loader v-else/>
</template>

<style scoped lang="scss">
	.Shortlink {
		@apply flex items-start;
		@apply space-x-6;

		.Shortlink-error {
			@apply flex items-center justify-center;
			@apply space-x-3;
			@apply w-full;
			@apply text-xl text-red-600 font-mono;
		}

		.Shortlink-qrCode {
			@apply relative;
			@apply w-[272px] h-[272px];
			@apply bg-gray-900;
			@apply rounded-xl;
			@apply shadow;
			@apply overflow-hidden;

			.Shortlink-qrCodeLoader {
				@apply absolute inset-0;
				@apply flex flex-col items-center justify-center;
				@apply w-[272px] h-[272px];
				@apply bg-black bg-opacity-20;
				@apply backdrop-blur;
				@apply z-10;
			}

			img {
				@apply w-[272px] h-[272px];
			}
		}

		.Shortlink-info {
			@apply flex flex-col;
			@apply space-y-3;

			.Shortlink-infoSection {
				@apply space-y-1.5;

				h2 {
					@apply text-xl font-bold;
				}
			}
		}
	}
</style>
