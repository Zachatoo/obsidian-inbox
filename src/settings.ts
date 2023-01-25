import type { WalkthroughStatus } from "./walkthrough/WalkthroughStatus";

export interface InboxPluginSettings {
	inboxNotePath: string;
	inboxNoteBaseContents: string;
	noticeDurationSeconds: number | undefined;
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	inboxNoteBaseContents: "",
	noticeDurationSeconds: undefined,
	walkthroughStatus: "unstarted",
};
