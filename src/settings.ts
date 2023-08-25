import type { WalkthroughStatus } from "./walkthrough/WalkthroughStatus";

export enum TrackingTypes {
	file = "file",
	folder = "folder",
}

type TrackingType = keyof typeof TrackingTypes;

export interface InboxPluginSettings {
	trackingType: TrackingType;
	inboxNotePath: string;
	compareType: "compareToBase" | "compareToLastTracked";
	inboxNoteBaseContents: string; // used when comparing to base
	inboxNoteContents: string; // used when comparing to last tracked
	inboxFolderFiles: string[]; // list of filenames in folder
	noticeDurationSeconds: number | null;
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	trackingType: "file",
	inboxNotePath: "",
	compareType: "compareToLastTracked",
	inboxNoteBaseContents: "",
	inboxNoteContents: "",
	inboxFolderFiles: [],
	noticeDurationSeconds: null,
	walkthroughStatus: "unstarted",
};

export function migrateSettings(settings: InboxPluginSettings) {
	if (
		settings.trackingType === "file" &&
		settings.inboxNotePath &&
		!settings.inboxNotePath.endsWith(".md")
	) {
		settings.inboxNotePath += ".md";
	}

	return settings;
}
