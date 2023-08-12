import {
	Platform,
	Plugin,
	TFile,
	WorkspaceLeaf,
	type MarkdownFileInfo,
} from "obsidian";
import { getValueFromMarkdownFileInfo } from "./obsidian/markdown-file-info-helpers";
import { ErrorNotice, InfoNotice } from "./Notice";
import {
	DEFAULT_SETTINGS,
	migrateSettings,
	type InboxPluginSettings,
} from "./settings";
import { SettingsTab } from "./settings-tab/SettingsTab";
import store from "./store";
import {
	InboxWalkthroughView,
	VIEW_TYPE_WALKTHROUGH,
} from "./walkthrough/WalkthroughView";
import { findMarkdownLeavesMatchingPath } from "./obsidian/workspace-helpers";

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
				const { activeEditor: fileInfo } = app.workspace;
				if (!fileInfo || !fileInfo.file || !fileInfo.editor) {
					return false;
				}
				if (checking) {
					return true;
				}
				this.setInboxNote(fileInfo);
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
				store.walkthrough.reset();
				this.ensureWalkthroughViewExists();
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

		this.settings = migrateSettings(this.settings);

		store.set(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	ensureWalkthroughViewExists(active = false) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf;
		const existingPluginLeaves = workspace.getLeavesOfType(
			VIEW_TYPE_WALKTHROUGH
		);

		// There's already an existing leaf with our view, do not create leaf
		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0];
		} else {
			// View doesn't exist yet, reate it and make it visible
			leaf = workspace.getRightLeaf(false);
			workspace.revealLeaf(leaf);
			leaf.setViewState({ type: VIEW_TYPE_WALKTHROUGH });
		}

		if (active) {
			workspace.setActiveLeaf(leaf);
		}
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
			this.settings.inboxNotePath
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
				this.settings.noticeDurationSeconds ?? undefined
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
		const inboxNoteLeaves = findMarkdownLeavesMatchingPath(
			this.app.workspace,
			this.settings.inboxNotePath
		);
		if (inboxNoteLeaves.some(Boolean)) {
			this.app.workspace.setActiveLeaf(inboxNoteLeaves[0], {
				focus: true,
			});
			return;
		}

		const inboxNote = this.app.vault.getAbstractFileByPath(
			this.settings.inboxNotePath
		);
		if (inboxNote instanceof TFile) {
			const leaf = this.app.workspace.getLeaf(true);
			leaf.openFile(inboxNote);
			return;
		}

		new ErrorNotice(`Failed to find inbox note at path ${inboxNote}.`);
	}

	setInboxNote(fileInfo: MarkdownFileInfo) {
		if (!fileInfo.file || !fileInfo.editor) {
			new ErrorNotice("Failed to set inbox note, no editor detected.");
			return;
		}

		this.settings.inboxNotePath = fileInfo.file.path;

		if (this.settings.compareType === "compareToBase") {
			this.settings.inboxNoteBaseContents =
				getValueFromMarkdownFileInfo(fileInfo);
		}
		if (this.settings.compareType === "compareToLastTracked") {
			this.settings.inboxNoteContents =
				getValueFromMarkdownFileInfo(fileInfo).trim();
		}

		if (
			this.getIsWalkthroughViewOpen() &&
			this.settings.walkthroughStatus === "runSetInboxNoteCommand"
		) {
			store.walkthrough.next();
		}

		this.saveSettings();

		let message = `Inbox note path set to ${this.settings.inboxNotePath}`;
		if (this.settings.compareType === "compareToBase") {
			message += `\nInbox note base contents set to\n${
				this.settings.inboxNoteBaseContents || "<blank>"
			}`;
		}
		new InfoNotice(message);
	}
}
