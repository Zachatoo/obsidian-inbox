import { writable } from "svelte/store";
import { WalkthroughStatuses } from "./walkthrough/WalkthroughStatus";
import type { InboxPluginSettingsV2 } from "./settings/InboxPluginSettingsV2";
import { transition } from "./walkthrough/walkthrough-state-machine";
import { WalkthroughActions } from "./walkthrough/WalkthroughAction";

function createStore() {
	const { subscribe, set, update } = writable<InboxPluginSettingsV2>();

	const walkthrough = {
		next() {
			update((settings) => transition(settings, WalkthroughActions.next));
		},

		previous() {
			update((settings) =>
				transition(settings, WalkthroughActions.previous)
			);
		},

		complete() {
			update((settings) => {
				settings.walkthroughStatus = WalkthroughStatuses.completed;
				return settings;
			});
		},

		start() {
			update((settings) => {
				settings.walkthroughStatus =
					WalkthroughStatuses.setCompareFileOrFolder;
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
