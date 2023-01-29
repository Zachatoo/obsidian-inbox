import { derived, writable } from "svelte/store";
import type InboxPlugin from "src/main";
import { WALKTHROUGH_STATUS_OPTIONS } from "./walkthrough/WalkthroughStatus";

function createStore() {
	const { subscribe, set, update } = writable<InboxPlugin>();

	const walkthrough = {
		next() {
			update((plugin) => {
				const currentStepIndex = WALKTHROUGH_STATUS_OPTIONS.indexOf(
					plugin.settings.walkthroughStatus
				);
				if (currentStepIndex + 1 < WALKTHROUGH_STATUS_OPTIONS.length) {
					const nextStep =
						WALKTHROUGH_STATUS_OPTIONS[currentStepIndex + 1];
					plugin.settings.walkthroughStatus = nextStep;
				}
				plugin.saveSettings();
				return plugin;
			});
		},

		back() {
			update((plugin) => {
				const currentStepIndex = WALKTHROUGH_STATUS_OPTIONS.indexOf(
					plugin.settings.walkthroughStatus
				);
				if (currentStepIndex > 0) {
					const nextStep =
						WALKTHROUGH_STATUS_OPTIONS[currentStepIndex - 1];
					plugin.settings.walkthroughStatus = nextStep;
				}
				plugin.saveSettings();
				return plugin;
			});
		},

		complete() {
			update((plugin) => {
				plugin.settings.walkthroughStatus = "completed";
				plugin.saveSettings();
				return plugin;
			});
		},

		reset() {
			update((plugin) => {
				plugin.settings.walkthroughStatus = "unstarted";
				plugin.saveSettings();
				return plugin;
			});
		},
	};

	return {
		subscribe,
		set,
		walkthrough,
	};
}

const store = createStore();

export default store;

export const currentWalkthroughStep = derived(store, ($plugin) => {
	if ($plugin?.settings?.walkthroughStatus) {
		return (
			WALKTHROUGH_STATUS_OPTIONS.indexOf(
				$plugin.settings.walkthroughStatus
			) + 1
		);
	}
	return 0;
});
