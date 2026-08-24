<script lang="ts" setup>
import type { Component } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useToastStore } from '~/stores/toast';
import { computed, onUnmounted, ref } from 'vue';
import AppButton from '~/components/AppButton.vue';
import CopyIcon from '~/components/icons/CopyIcon.vue';
import CheckIcon from '~/components/icons/CheckIcon.vue';

const { text, icon, content, size = 'normal' } = defineProps<{
	text?: string;
	icon?: Component;
	content: string;
	size?: 'normal' | 'small' | 'large';
}>();

const copiedState = ref(false);
const iconClass = computed(() => [{
	'mr-1.5 h-3': size === 'small',
	'mr-2 h-4': size === 'normal',
	'mr-2 h-5': size === 'large',
}]);

const { copy } = useClipboard({ legacy: true });
const { createToast } = useToastStore();
let resetTimer: ReturnType<typeof setTimeout> | undefined;

const copyContent = async () => {
	await copy(content);
	copiedState.value = true;
	clearTimeout(resetTimer);
	resetTimer = setTimeout(() => copiedState.value = false, 1_500);
	createToast('success', 'Copied to clipboard!', true);
};

onUnmounted(() => clearTimeout(resetTimer));
</script>

<template>
	<app-button :size="size" :variant="copiedState ? 'success' : 'brand'" @click.prevent="copyContent">
		<component :is="icon ?? CopyIcon" v-if="!copiedState" :class="iconClass" />
		<check-icon v-else :class="iconClass" />
		<span v-if="text">{{ text }}</span>
	</app-button>
</template>
