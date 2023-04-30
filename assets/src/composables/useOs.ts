import { ref } from 'vue';
import type { Ref } from 'vue';

type OperatingSystem = 'Windows' | 'Mac' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

export default function useOs(): {
	isWindows: Ref<boolean>,
	isMac: Ref<boolean>,
	isLinux: Ref<boolean>,
	isIOS: Ref<boolean>,
	isAndroid: Ref<boolean>,
	isUnknown: Ref<boolean>
} {
	const os: OperatingSystem = detectOperatingSystem();

	console.log(os);

	const isWindows = ref(os === 'Windows');
	const isMac     = ref(os === 'Mac');
	const isLinux   = ref(os === 'Linux');
	const isIOS     = ref(os === 'iOS');
	const isAndroid = ref(os === 'Android');
	const isUnknown = ref(os === 'Unknown');

	return {
		isWindows,
		isMac,
		isLinux,
		isIOS,
		isAndroid,
		isUnknown
	};
}

function detectOperatingSystem(): OperatingSystem {
	const userAgent = window.navigator.userAgent;
	if (/win/i.test(userAgent)) {
		return 'Windows';
	} else if (/mac/i.test(userAgent)) {
		return 'Mac';
	} else if (/linux/i.test(userAgent)) {
		return 'Linux';
	} else if (/iphone|ipad|ipod/i.test(userAgent)) {
		return 'iOS';
	} else if (/android/i.test(userAgent)) {
		return 'Android';
	}

	return 'Unknown';
}
