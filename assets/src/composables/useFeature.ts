export function useFeatures() {
	const attribute = document.querySelector('meta[name="enabled-features"]') as HTMLMetaElement;
	const features  = attribute.content.split(',');

	const isFeatureEnabled = (feature: string) => {
		return features.includes(feature);
	};

	return {
		features,
		isFeatureEnabled
	};
}
