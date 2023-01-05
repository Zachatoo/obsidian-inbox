import { Editor, MarkdownView, Platform, Plugin, TFile } from "obsidian";
import { ErrorNotice, InfoNotice } from "./Notice";
import { InboxPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { SettingsTab } from "./SettingsTab";

export default class InboxPlugin extends Plugin {
	settings: InboxPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "set-inbox-note",
			name: "Set inbox note",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.settings.inboxNotePath = view.file.path.slice(0, -3); // strip off ".md" from end of path
				this.settings.inboxNoteBaseContents = editor.getValue();
				this.saveSettings();

				new InfoNotice(
					`Inbox note path set to ${this.settings.inboxNotePath}\nInbox note base contents set to\n${this.settings.inboxNoteBaseContents}`
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
			`${this.settings.inboxNotePath}.md`
		);
		if (!inboxNote || !(inboxNote instanceof TFile)) {
			new ErrorNotice(`Failed to find inbox note at path ${inboxNote}.`);
			return;
		}

		const contents = await this.app.vault.read(inboxNote);
		if (contents.trim() !== this.settings.inboxNoteBaseContents.trim()) {
			const baseMessage = `You have data to process in ${this.settings.inboxNotePath}`;
			const message = Platform.isDesktop
				? `${baseMessage}\nClick to dismiss, or right click to view inbox note.`
				: `${baseMessage}\nClick to dismiss.`;
			const notice = new InfoNotice(
				message,
				this.settings.noticeDurationSeconds !== undefined
					? this.settings.noticeDurationSeconds
					: undefined
			);

			if (Platform.isDesktop) {
				notice.noticeEl.oncontextmenu = () => {
					this.openInboxNote();
					notice.hide();
				};
			}
		}
	}

	openInboxNote() {
		const inboxNote = this.app.vault.getAbstractFileByPath(
			`${this.settings.inboxNotePath}.md`
		);
		if (!(inboxNote instanceof TFile)) {
			new ErrorNotice(`Failed to find inbox note at path ${inboxNote}.`);
			return;
		}

		const leaf = this.app.workspace.getLeaf(true);
		leaf.openFile(inboxNote);
	}
}
