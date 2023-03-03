import { defineStore } from 'pinia';

export const useGitStore = defineStore('git', {
	state: () => ({
		latestSha: '...',
	}),
	getters: {
		shortenedLatestSha: (state) => state.latestSha.substring(0, 7),
	}
});
