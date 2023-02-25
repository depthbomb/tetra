<script setup lang="ts">
	import '~/assets/css/components/btn.scss';
	import { RouterLink, type RouteLocationRaw } from 'vue-router';

	const props = defineProps<{
		to: RouteLocationRaw,
		variant?: 'brand' | 'danger' | 'error',
		size?: 'normal' | 'small' | 'large'
	}>();

	const buttonClass = ['btn', `btn--${props.variant ?? 'brand'}`, {
		'btn--small': props.size === 'small',
		'btn--large': props.size === 'large',
	}];

	const isExternalLink = () => typeof props.to === 'string' && props.to.startsWith('http');
	const isServerLink   = () => typeof props.to === 'string' && props.to.startsWith('/');
</script>

<template>
	<a v-if="isExternalLink() || isServerLink()" :href="to.toString()" :class="buttonClass">
		<slot/>
	</a>
	<router-link v-else :to="to" :class="buttonClass">
		<slot/>
	</router-link>
</template>
