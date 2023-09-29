import type { TrackingType } from "./TrackingTypes";

export interface Inbox {
	/**
	 * Whether to track inbox by referencing the contents of
	 * a single file or a folder of files.
	 */
	trackingType: TrackingType;
	/**
	 * Path to inbox note/folder.
	 * @example <caption>Set inbox note.</caption>
	 * inbox.path = "Path/To/Inbox.md";
	 * @example <caption>Set inbox folder.</caption>
	 * inbox.path = "Path/To/Inbox";
	 */
	path: string;
	/**
	 * What to compare the inbox note contents to when deciding whether or not to notify.
	 * `compareToBase` will compare against `inboxNoteBaseContents`.
	 * `compareToLastTracked` will compare against `inboxNoteContents`.
	 */
	compareType: "compareToBase" | "compareToLastTracked";
	/**
	 * User defined default state of inbox note if there is nothing to process.
	 * Used when `compareType` is set to "compareToBase".
	 * @see Inbox.compareType
	 */
	inboxNoteBaseContents: string;
	/**
	 * Last tracked contents of inbox note.
	 * If the contents of the inbox note match this on startup, then there is nothing to process.
	 * Used when `compareType` is set to "compareToLastTracked".
	 * @see Inbox.compareType
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
}

export const DEFAULT_INBOX: Inbox = Object.freeze({
	trackingType: "note",
	path: "",
	compareType: "compareToLastTracked",
	inboxNoteBaseContents: "",
	inboxNoteContents: "",
	inboxFolderFiles: [],
	noticeDurationSeconds: null,
});
