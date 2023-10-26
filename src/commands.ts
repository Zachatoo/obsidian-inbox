import type InboxPlugin from "./main";

export function addCommands(plugin: InboxPlugin) {
	plugin.addCommand({
		id: "add-inbox-note",
		name: "Add inbox note",
		checkCallback: (checking) => {
			const { activeEditor: fileInfo } = app.workspace;
			if (!fileInfo || !fileInfo.file || !fileInfo.editor) {
				return false;
			}
			if (checking) {
				return true;
			}
			plugin.addInboxNote(fileInfo);
		},
	});
}
