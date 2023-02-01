import { Editor, MarkdownView, Platform, Plugin, TFile } from "obsidian";
import { ErrorNotice, InfoNotice } from "./Notice";
import { DEFAULT_SETTINGS, type InboxPluginSettings } from "./settings";
import { SettingsTab } from "./settings-tab/SettingsTab";
import store from "./store";
import {
	InboxWalkthroughView,
	VIEW_TYPE_WALKTHROUGH,
} from "./walkthrough/WalkthroughView";

export default class InboxPlugin extends Plugin {
	settings: InboxPluginSettings;
	hasPerformedCheck: boolean;

	async onload() {
		this.hasPerformedCheck = false;
		await this.loadSettings();

		this.register(
			store.subscribe(async (settings) => {
				this.settings = settings;
				await this.saveSettings();
			})
		);

		this.registerView(
			VIEW_TYPE_WALKTHROUGH,
			(leaf) => new InboxWalkthroughView(leaf, this)
		);

		this.addCommand({
			id: "set-inbox-note",
			name: "Set inbox note",
			checkCallback: (checking) => {
				const activeLeaf =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!activeLeaf) {
					return false;
				}
				if (checking) {
					return true;
				}
				this.setInboxNote(activeLeaf);
			},
		});

		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				if (
					this.hasPerformedCheck &&
					file.basename === this.settings.inboxNotePath
				) {
					this.settings.inboxNoteContents = data.trim();
					await this.saveSettings();
				}
			})
		);

		this.addSettingTab(new SettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			if (this.settings.walkthroughStatus === "unstarted") {
				this.settings.walkthroughStatus = "setCompareType";
				await this.saveSettings();
				this.activateWalkthroughView();
			} else {
				await this.notifyIfInboxNeedsProcessing();
			}
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);
		this.hasPerformedCheck = false;
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		store.set(this.settings);
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

	getIsWalkthroughViewOpen() {
		return (
			this.app.workspace.getLeavesOfType(VIEW_TYPE_WALKTHROUGH).length > 0
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

		const contents = (await this.app.vault.read(inboxNote)).trim();

		let shouldNotify = false;
		switch (this.settings.compareType) {
			case "compareToBase":
				shouldNotify =
					contents !== this.settings.inboxNoteBaseContents.trim();
				break;
			case "compareToLastTracked":
				shouldNotify =
					contents !== this.settings.inboxNoteContents.trim();
				break;
			default:
				break;
		}

		if (shouldNotify) {
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

		this.hasPerformedCheck = true;
		this.settings.inboxNoteContents = contents;
		await this.saveSettings();
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

	setInboxNote(leaf: MarkdownView) {
		this.settings.inboxNotePath = leaf.file.path.slice(0, -3); // strip off ".md" from end of path
		if (this.settings.compareType === "compareToBase") {
			this.settings.inboxNoteBaseContents = leaf.editor.getValue();
		}
		if (this.settings.compareType === "compareToLastTracked") {
			this.settings.inboxNoteContents = leaf.editor.getValue().trim();
		}

		if (
			this.getIsWalkthroughViewOpen() &&
			this.settings.walkthroughStatus === "runSetInboxNoteCommand"
		) {
			store.walkthrough.next();
		}

		this.saveSettings();

		new InfoNotice(
			`Inbox note path set to ${this.settings.inboxNotePath}${
				this.settings.compareType === "compareToBase"
					? `\nInbox note base contents set to\n${this.settings.inboxNoteBaseContents}`
					: ""
			}`
		);
	}
}
