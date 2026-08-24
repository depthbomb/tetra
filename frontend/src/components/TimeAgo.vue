<script lang="ts" setup>
import { computed, ref } from 'vue';
import { UseTimeAgo } from '@vueuse/components';

const { date, toggleable = true, inverse = false } = defineProps<{
	date: string | number | Date;
	toggleable?: boolean;
	inverse?: boolean;
}>();

const toggled = ref<boolean>(inverse);
const parsedDate = computed(() => new Date(date));

const toggle = () => {
	if (toggleable) {
		toggled.value = !toggled.value;
	}
};
</script>

<template>
	<use-time-ago v-slot="{ timeAgo }" :time="parsedDate">
		<span :class="['TimeAgo', { 'is-toggleable': toggleable }]" @click="toggle">
			<template v-if="toggled">{{ parsedDate.toDateString() }}</template>
			<template v-else>{{ timeAgo }}</template>
		</span>
	</use-time-ago>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.TimeAgo {
	&.is-toggleable {
		@apply cursor-pointer;
		@apply border-b border-current border-dotted;
	}
}
</style>
