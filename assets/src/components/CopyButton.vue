<script setup lang="ts">
	import { ref } from 'vue';
	import { useClipboard } from '@vueuse/core';
	import AppButton from '~/components/AppButton.vue';
	import CopyIcon from '~/components/icons/CopyIcon.vue';
	import CheckIcon from '~/components/icons/CheckIcon.vue';

	const { copy } = useClipboard({ legacy: true });

	const props = defineProps<{
		text?: string;
		content: string;
		size?: 'small' | 'medium' | 'large';
	}>();

	const copiedState = ref(false);
	const iconClass   = ref([{
		'mr-1.5 h-3.5': !props.size || props.size === 'small',
		'mr-2 h-5':     props.size === 'medium' || props.size === 'large',
	}]);

	const doCopyLink = () => {
		copy(props.content);
		copiedState.value = true;
		setTimeout(() => copiedState.value = false, 1_500);
	};
</script>

<template>
	<app-button :variant="copiedState ? 'success' : 'brand'" @click.prevent="doCopyLink">
		<copy-icon v-if="!copiedState" :class="iconClass"/>
		<check-icon v-else :class="iconClass"/>
		<span v-if="text">{{ text }}</span>
	</app-button>
</template>
