<script setup lang="ts">
	import { ref } from 'vue';
	import { UseTimeAgo } from '@vueuse/components';

	const props = withDefaults(defineProps<{
		date:        string | number | Date;
		toggleable?: boolean;
		inverse?:    boolean;
	}>(), {
		toggleable: true,
		inverse: false
	});

	const toggled    = ref(props.inverse);
	const parsedDate = ref(new Date(props.date));

	const toggle = () => {
		if (props.toggleable) {
			toggled.value = !toggled.value;
		}
	}
</script>

<template>
	<use-time-ago v-slot="{ timeAgo }" :time="parsedDate">
		<span as="span" :class="['TimeAgo', { 'is-toggleable': toggleable }]" @click="toggle">
			<template v-if="toggled">{{ parsedDate.toDateString() }}</template>
			<template v-else>{{ timeAgo }}</template>
		</span>
	</use-time-ago>
</template>

<style scoped lang="scss">
	.TimeAgo {

		&.is-toggleable {
			@apply cursor-pointer;
			@apply border-b border-current border-dotted;
		}
	}
</style>
