<script setup lang="ts">
	import '~/assets/css/components/btn.scss';

	const props = defineProps<{
		variant?: 'brand' | 'danger' | 'error',
		size?: 'normal' | 'small' | 'large'
	}>();

	const buttonClass = ['btn', `btn--${props.variant ?? 'brand'}`, {
		'btn--small': props.size === 'small',
		'btn--large': props.size === 'large',
	}];
</script>

<template>
	<button :class="buttonClass">
		<slot/>
	</button>
</template>
