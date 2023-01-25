import { Editor, MarkdownView, Platform, Plugin, TFile } from "obsidian";
import { ErrorNotice, InfoNotice } from "./Notice";
import { DEFAULT_SETTINGS, type InboxPluginSettings } from "./settings";
import { SettingsTab } from "./SettingsTab";
import store from "./store";
import {
	InboxWalkthroughView,
	VIEW_TYPE_WALKTHROUGH,
} from "./walkthrough/WalkthroughView";

export default class InboxPlugin extends Plugin {
	settings: InboxPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_WALKTHROUGH,
			(leaf) => new InboxWalkthroughView(leaf, this)
		);

		this.addCommand({
			id: "set-inbox-note",
			name: "Set inbox note",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.settings.inboxNotePath = view.file.path.slice(0, -3); // strip off ".md" from end of path
				this.settings.inboxNoteBaseContents = editor.getValue();

				const isWalkthroughOpen =
					this.app.workspace.getLeavesOfType(VIEW_TYPE_WALKTHROUGH)
						.length > 0;

				if (
					isWalkthroughOpen &&
					this.settings.walkthroughStatus === "unstarted"
				) {
					store.next();
				}

				new InfoNotice(
					`Inbox note path set to ${this.settings.inboxNotePath}\nInbox note base contents set to\n${this.settings.inboxNoteBaseContents}`
				);
			},
		});

		this.addSettingTab(new SettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.notifyIfInboxNeedsProcessing();

			if (
				this.settings.walkthroughStatus === "unstarted" &&
				!this.settings.inboxNotePath
			) {
				this.activateWalkthroughView();
			}
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		store.set(this);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateWalkthroughView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_WALKTHROUGH,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_WALKTHROUGH)[0]
		);
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
