import { ref, onMounted, onUnmounted } from 'vue';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const KONAMI_CODE_LENGTH = KONAMI_CODE.length;

export function useKonamiCode() {
	const konamiIndex = ref(0);
	const codeEntered = ref(false);

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === KONAMI_CODE[konamiIndex.value]) {
			konamiIndex.value++
			if (konamiIndex.value === KONAMI_CODE_LENGTH) {
				codeEntered.value = true;
				konamiIndex.value = 0;
			}
		} else {
			konamiIndex.value = 0;
		}
	}

	onMounted(()   => window.addEventListener('keydown', onKeyDown));
	onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

	return { codeEntered };
}
