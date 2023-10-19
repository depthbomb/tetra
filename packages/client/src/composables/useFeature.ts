import { useBridge } from '~/composables/useBridge';

export function useFeatures() {
	const features         = useBridge('enabled-features');
	const isFeatureEnabled = (feature: string) => {
		return features.includes(feature);
	};

	return {
		features,
		isFeatureEnabled
	};
}
