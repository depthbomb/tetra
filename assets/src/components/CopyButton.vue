<script setup lang="ts">
	import { ref } from 'vue';
	import { useClipboard } from '@vueuse/core';
	import { useToastStore } from '~/stores/toast';
	import AppButton from '~/components/AppButton.vue';
	import CopyIcon from '~/components/icons/CopyIcon.vue';
	import CheckIcon from '~/components/icons/CheckIcon.vue';
	import type { Component } from 'vue';

	const { text, icon, content, size = 'normal' } = defineProps<{
		text?: string;
		icon?: Component;
		content: string;
		size?: 'normal' | 'small' | 'large';
	}>();

	const copiedState = ref(false);
	const iconClass   = ref([{
		'mr-1.5 h-3': size === 'small',
		'mr-2 h-4':   size === 'normal',
		'mr-2 h-5':   size === 'large',
	}]);

	const { copy }        = useClipboard({ legacy: true });
	const { createToast } = useToastStore();

	const copyLink = () => {
		copy(content);
		copiedState.value = true;
		setTimeout(() => copiedState.value = false, 1_500);
		createToast('success', 'Copied to clipboard!');
	};
</script>

<template>
	<app-button :variant="copiedState ? 'success' : 'brand'" :size="size" @click.prevent="copyLink">
		<component v-if="!copiedState" :is="icon ?? CopyIcon" :class="iconClass"/>
		<check-icon v-else :class="iconClass"/>
		<span v-if="text">{{ text }}</span>
	</app-button>
</template>
