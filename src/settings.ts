export interface InboxPluginSettings {
	inboxNotePath: string;
	inboxNoteBaseContents: string;
	noticeDurationSeconds: number | undefined;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	inboxNoteBaseContents: "",
	noticeDurationSeconds: undefined,
};
