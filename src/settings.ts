import type { WalkthroughStatus } from "./walkthrough/WalkthroughStatus";

export enum TrackingTypes {
	note = "note",
	folder = "folder",
}

export type TrackingType = keyof typeof TrackingTypes;

export interface InboxPluginSettings {
	/**
	 * Whether to track inbox by referencing the contents of
	 * a single file or a folder of files.
	 */
	trackingType: TrackingType;
	/**
	 * Path to inbox note/folder.
	 * @example <caption>Set inbox note.</caption>
	 * settings.inboxNotePath = "Path/To/Inbox.md";
	 * @example <caption>Set inbox folder.</caption>
	 * settings.inboxNotePath = "Path/To/Inbox";
	 */
	inboxNotePath: string;
	/**
	 * What to compare the inbox note contents to when deciding whether or not to notify.
	 * `compareToBase` will compare against `inboxNoteBaseContents`.
	 * `compareToLastTracked` will compare against `inboxNoteContents`.
	 */
	compareType: "compareToBase" | "compareToLastTracked";
	/**
	 * User defined default state of inbox note if there is nothing to process.
	 * Used when `compareType` is set to "compareToBase".
	 * @see InboxPluginSettings.compareType
	 */
	inboxNoteBaseContents: string;
	/**
	 * Last tracked contents of inbox note.
	 * If the contents of the inbox note match this on startup, then there is nothing to process.
	 * Used when `compareType` is set to "compareToLastTracked".
	 * @see InboxPluginSettings.compareType
	 */
	inboxNoteContents: string;
	/**
	 * Last tracked list of filenames in inbox folder.
	 * If this list matches the list of files in the inbox folder
	 * on startup, then there is nothing to process.
	 */
	inboxFolderFiles: string[];
	/**
	 * Duration to show Notice when there is data to process, in seconds.
	 * Set to `0` for infinite duration.
	 * Set to `null` to use global default Notice duration.
	 */
	noticeDurationSeconds: number | null;
	/**
	 * The current step of the walkthrough.
	 */
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	trackingType: "note",
	inboxNotePath: "",
	compareType: "compareToLastTracked",
	inboxNoteBaseContents: "",
	inboxNoteContents: "",
	inboxFolderFiles: [],
	noticeDurationSeconds: null,
	walkthroughStatus: "unstarted",
};

/**
 * Handles any backwards incompatible changes to the settings schema.
 * @param settings The plugin settings.
 * @returns The plugin settings with any migrations applied.
 */
export function migrateSettings(settings: InboxPluginSettings) {
	// If tracking by file, the file path must end with .md
	if (
		settings.trackingType === "note" &&
		settings.inboxNotePath &&
		!settings.inboxNotePath.endsWith(".md")
	) {
		settings.inboxNotePath += ".md";
	}

	return settings;
}
