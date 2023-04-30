import { ref } from 'vue';

export function useRandomItem(items) {
	const selectedItem = ref(null);

	const chooseRandomItem = () => {
		const randomIndex = Math.floor(Math.random() * items.length);
		selectedItem.value = items[randomIndex];
	}

	return {
		selectedItem,
		chooseRandomItem,
	};
}
