import { derived, writable } from "svelte/store";
import { WALKTHROUGH_STATUS_OPTIONS } from "./walkthrough/WalkthroughStatus";
import type { InboxPluginSettings } from "./settings";

function createStore() {
	const { subscribe, set, update } = writable<InboxPluginSettings>();

	const walkthrough = {
		next() {
			update((settings) => {
				const currentStepIndex = WALKTHROUGH_STATUS_OPTIONS.indexOf(
					settings.walkthroughStatus
				);
				if (currentStepIndex + 1 < WALKTHROUGH_STATUS_OPTIONS.length) {
					const nextStep =
						WALKTHROUGH_STATUS_OPTIONS[currentStepIndex + 1];
					settings.walkthroughStatus = nextStep;
				}
				return settings;
			});
		},

		back() {
			update((settings) => {
				const currentStepIndex = WALKTHROUGH_STATUS_OPTIONS.indexOf(
					settings.walkthroughStatus
				);
				if (currentStepIndex > 0) {
					const nextStep =
						WALKTHROUGH_STATUS_OPTIONS[currentStepIndex - 1];
					settings.walkthroughStatus = nextStep;
				}
				return settings;
			});
		},

		complete() {
			update((settings) => {
				settings.walkthroughStatus = "completed";
				return settings;
			});
		},

		reset() {
			update((settings) => {
				settings.walkthroughStatus = "setCompareType";
				return settings;
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

export const currentWalkthroughStep = derived(store, ($settings) => {
	if ($settings?.walkthroughStatus) {
		return WALKTHROUGH_STATUS_OPTIONS.indexOf($settings.walkthroughStatus);
	}
	return 0;
});
