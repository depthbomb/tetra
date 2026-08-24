const features = [
	'AUTHENTICATION',
	'SHORTLINK_CREATION',
	'SHORTLINK_REDIRECTION'
] as const;

type Feature = typeof features[number];

export function useFeatures() {
	const isFeatureEnabled = (feature: Feature) => features.includes(feature);

	return {
		features,
		isFeatureEnabled
	};
}
