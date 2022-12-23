export interface InboxPluginSettings {
	inboxNotePath: string;
	inboxNoteBaseContents: string;
	noticeDurationMs: number | undefined;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	inboxNoteBaseContents: "",
	noticeDurationMs: undefined,
};
