import type { WalkthroughStatus } from "./walkthrough/WalkthroughStatus";

export interface InboxPluginSettings {
	inboxNotePath: string;
	compareType: "compareToBase" | "compareToLastTracked";
	inboxNoteBaseContents: string; // used when comparing to base
	inboxNoteContents: string; // used when comparing to last tracked
	noticeDurationSeconds: number | null;
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	compareType: "compareToLastTracked",
	inboxNoteBaseContents: "",
	inboxNoteContents: "",
	noticeDurationSeconds: null,
	walkthroughStatus: "unstarted",
};

export function migrateSettings(settings: InboxPluginSettings) {
	if (settings.inboxNotePath && !settings.inboxNotePath.endsWith(".md")) {
		settings.inboxNotePath += ".md";
	}

	return settings;
}
