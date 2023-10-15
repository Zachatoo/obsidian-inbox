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

	function addInbox() {
		update((settings) => {
			settings.inboxes.push({
				trackingType: "note",
				path: "",
				compareType: "compareToBase",
				inboxNoteBaseContents: "",
				inboxNoteContents: "",
				inboxFolderFiles: [],
				noticeDurationSeconds: null,
			});
			return settings;
		});
	}

	function moveInboxUp(index: number) {
		update((settings) => {
			if (index - 1 >= 0) {
				const replaced = settings.inboxes.at(index - 1);
				if (replaced) {
					settings.inboxes[index - 1] = settings.inboxes[index];
					settings.inboxes[index] = replaced;
				}
			}
			return settings;
		});
	}

	function moveInboxDown(index: number) {
		update((settings) => {
			if (index <= settings.inboxes.length) {
				const replaced = settings.inboxes.at(index + 1);
				if (replaced) {
					settings.inboxes[index + 1] = settings.inboxes[index];
					settings.inboxes[index] = replaced;
				}
			}
			return settings;
		});
	}

	function removeInbox(index: number) {
		update((settings) => {
			settings.inboxes.splice(index, 1);
			return settings;
		});
	}

	return {
		subscribe,
		set,
		walkthrough,
		addInbox,
		moveInboxUp,
		moveInboxDown,
		removeInbox,
	};
}

const store = createStore();

export default store;
