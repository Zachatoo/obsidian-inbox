import { Editor, MarkdownView, Notice, Plugin, TFile } from "obsidian";
import { InboxPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { SettingsTab } from "./SettingsTab";

export default class InboxPlugin extends Plugin {
	settings: InboxPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "inbox-set-inbox-note",
			name: "Set inbox note",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.settings.inboxNotePath = view.file.path;
				this.settings.inboxNoteBaseContents = editor.getValue();
				this.saveSettings();

				new Notice(
					`Inbox note path set to ${this.settings.inboxNotePath}`
				);
				new Notice(
					`Inbox note base contents set to ${this.settings.inboxNoteBaseContents}`
				);
			},
		});

		this.addSettingTab(new SettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(() =>
			this.notifyIfInboxNeedsProcessing()
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async notifyIfInboxNeedsProcessing() {
		if (!this.settings.inboxNotePath) {
			return;
		}

		const inboxNote = this.app.vault.getAbstractFileByPath(
			this.settings.inboxNotePath
		);
		if (!inboxNote || !(inboxNote instanceof TFile)) {
			return;
		}

		const contents = await this.app.vault.read(inboxNote);
		if (contents.trim() !== this.settings.inboxNoteBaseContents.trim()) {
			new Notice(
				`Inbox\nYou have data to process in ${this.settings.inboxNotePath}`,
				this.settings.noticeDurationMs
			);
		}
	}
}
