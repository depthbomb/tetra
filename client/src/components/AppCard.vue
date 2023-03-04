<script setup lang="ts">
	import '~/assets/css/components/card.scss';
	import { useSlots } from 'vue';

	const slots = useSlots();

	defineProps<{
		bordered?: boolean;
		seamless?: boolean;
	}>();
</script>

<template>
	<div :class="['card', {
		'card--bordered': bordered,
		'card--seamless': seamless,
	}]">
		<div v-if="slots.header" class="card__header">
			<slot name="header"/>
		</div>
		<div class="card__content">
			<slot/>
		</div>
		<template v-if="slots.footer">
			<slot name="footer"/>
		</template>
	</div>
</template>
