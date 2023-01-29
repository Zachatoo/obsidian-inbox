import type { WalkthroughStatus } from "./walkthrough/WalkthroughStatus";

export interface InboxPluginSettings {
	inboxNotePath: string;
	compareType: "compareToBase" | "compareToLastTracked";
	inboxNoteBaseContents: string; // used when comparing to base
	inboxNoteContents: string; // used when comparing to last tracked
	noticeDurationSeconds: number | undefined;
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	compareType: "compareToLastTracked",
	inboxNoteBaseContents: "",
	inboxNoteContents: "",
	noticeDurationSeconds: undefined,
	walkthroughStatus: "unstarted",
};
