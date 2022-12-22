export interface InboxPluginSettings {
	inboxNotePath: string;
	inboxNoteBaseContents: string;
}

export const DEFAULT_SETTINGS: InboxPluginSettings = {
	inboxNotePath: "",
	inboxNoteBaseContents: "",
};
