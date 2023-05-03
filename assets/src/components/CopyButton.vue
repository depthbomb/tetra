<script setup lang="ts">
	import { ref } from 'vue';
	import { useClipboard } from '@vueuse/core';
	import { useToastStore } from '~/stores/toast';
	import AppButton from '~/components/AppButton.vue';
	import CopyIcon from '~/components/icons/CopyIcon.vue';
	import CheckIcon from '~/components/icons/CheckIcon.vue';
	import type { Component } from 'vue';

	const props = defineProps<{
		text?: string;
		icon?: Component;
		content: string;
		size?: 'normal' | 'small' | 'large';
	}>();

	const copiedState = ref(false);
	const iconClass   = ref([{
		'mr-1.5 h-3': !props.size || props.size === 'small',
		'mr-2 h-5':     props.size === 'normal' || props.size === 'large',
	}]);

	const { copy }        = useClipboard({ legacy: true });
	const { createToast } = useToastStore();

	const doCopyLink = () => {
		copy(props.content);
		copiedState.value = true;
		setTimeout(() => copiedState.value = false, 1_500);
		createToast('success', 'Copied to clipboard!');
	};
</script>

<template>
	<app-button :variant="copiedState ? 'success' : 'brand'" :size="size" @click.prevent="doCopyLink">
		<component v-if="!copiedState" :is="icon ?? CopyIcon" :class="iconClass"/>
		<check-icon v-else :class="iconClass"/>
		<span v-if="text">{{ text }}</span>
	</app-button>
</template>
