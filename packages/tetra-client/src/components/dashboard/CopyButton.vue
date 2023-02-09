<script setup lang="ts">
	import '~/assets/css/components/btn.scss';
	import { ref } from 'vue';
	import { useClipboard } from '@vueuse/core';
	import CopyIcon from '~/components/icons/CopyIcon.vue';
	import CheckIcon from '~/components/icons/CheckIcon.vue';

	const { copy } = useClipboard({ legacy: true });

	const props = defineProps<{
		text?: string;
		content: string;
		size?: 'small' | 'medium' | 'large';
	}>();

	const copiedState = ref(false);
	const buttonClass = ref(['btn btn--brand', `btn--${props.size ?? 'small'}`, {
		'btn--success': copiedState,
	}]);
	const iconClass = ref([{
		'mr-1 w-3 h-3': !props.size || props.size === 'small',
		'mr-2 w-5 h-5': props.size === 'medium' || props.size === 'large',
	}]);

	const doCopyLink = () => {
		copy(props.content);
		copiedState.value = true;
		setTimeout(() => copiedState.value = false, 1_000);
	};
</script>

<template>
	<button @click.prevent="doCopyLink" :class="buttonClass" type="button">
		<copy-icon v-if="!copiedState" :class="iconClass"/>
		<check-icon v-else :class="iconClass"/>
		<span v-if="text">{{ text }}</span>
	</button>
</template>
