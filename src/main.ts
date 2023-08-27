import {
	Platform,
	Plugin,
	TFile,
	WorkspaceLeaf,
	type MarkdownFileInfo,
	TFolder,
} from "obsidian";
import { getValueFromMarkdownFileInfo } from "./obsidian/markdown-file-info-helpers";
import { ErrorNotice, InfoNotice } from "./Notice";
import {
	DEFAULT_SETTINGS,
	migrateSettings,
	type InboxPluginSettings,
	TrackingTypes,
} from "./settings";
import { SettingsTab } from "./settings-tab/SettingsTab";
import store from "./store";
import {
	InboxWalkthroughView,
	VIEW_TYPE_WALKTHROUGH,
} from "./walkthrough/WalkthroughView";
import { findMarkdownLeavesMatchingPath } from "./obsidian/workspace-helpers";
import { WalkthroughStatuses } from "./walkthrough/WalkthroughStatus";
import { getAllFilesInFolderRecursive } from "./obsidian/tabstractfile-helpers";

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
				if (
					this.settings.trackingType !== TrackingTypes.note ||
					!fileInfo ||
					!fileInfo.file ||
					!fileInfo.editor
				) {
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
					this.settings.trackingType === TrackingTypes.note &&
					file.path === this.settings.inboxNotePath
				) {
					this.settings.inboxNoteContents = data.trim();
					await this.saveSettings();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("create", async (file) => {
				if (
					this.hasPerformedCheck &&
					this.settings.trackingType === TrackingTypes.folder &&
					file.path.startsWith(this.settings.inboxNotePath)
				) {
					this.settings.inboxFolderFiles.push(file.name);
					this.settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					await this.saveSettings();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("rename", async (file, oldPath) => {
				if (
					this.hasPerformedCheck &&
					this.settings.trackingType === TrackingTypes.folder
				) {
					const oldName = oldPath.split("/").at(-1);
					this.settings.inboxFolderFiles = [
						...this.settings.inboxFolderFiles.filter(
							(x) => x !== oldName
						),
						file.name,
					];
					this.settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					await this.saveSettings();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("delete", async (file) => {
				if (
					this.hasPerformedCheck &&
					this.settings.trackingType === TrackingTypes.folder &&
					file.path.startsWith(this.settings.inboxNotePath)
				) {
					this.settings.inboxFolderFiles =
						this.settings.inboxFolderFiles.filter(
							(x) => x !== file.name
						);
					this.settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					await this.saveSettings();
				}
			})
		);

		this.addSettingTab(new SettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			if (
				this.settings.walkthroughStatus ===
				WalkthroughStatuses.unstarted
			) {
				store.walkthrough.start();
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
		try {
			if (!this.settings.inboxNotePath) {
				return;
			}

			const inboxAbstractFile = this.app.vault.getAbstractFileByPath(
				this.settings.inboxNotePath
			);
			if (!inboxAbstractFile) {
				new ErrorNotice(
					`Failed to find inbox ${this.settings.trackingType.toString()} at path ${
						this.settings.inboxNotePath
					}.`
				);
				return;
			}

			let shouldNotify = false;
			if (inboxAbstractFile instanceof TFile) {
				const contents = (
					await this.app.vault.read(inboxAbstractFile)
				).trim();
				switch (this.settings.compareType) {
					case "compareToBase":
						shouldNotify =
							contents !==
							this.settings.inboxNoteBaseContents.trim();
						break;
					case "compareToLastTracked":
						shouldNotify =
							contents !== this.settings.inboxNoteContents.trim();
						break;
					default:
						break;
				}
				this.settings.inboxNoteContents = contents;
			} else if (inboxAbstractFile instanceof TFolder) {
				const filesInFolder =
					getAllFilesInFolderRecursive(inboxAbstractFile);
				filesInFolder.sort((a, b) => a.localeCompare(b));
				this.settings.inboxFolderFiles.sort((a, b) =>
					a.localeCompare(b)
				);
				shouldNotify =
					filesInFolder.join("") !==
					this.settings.inboxFolderFiles.join("");
				this.settings.inboxFolderFiles = filesInFolder;
			}

			if (shouldNotify) {
				const enableClickToView =
					Platform.isDesktop && inboxAbstractFile instanceof TFile;
				const baseMessage = `You have data to process in ${this.settings.inboxNotePath}`;
				const message = enableClickToView
					? `${baseMessage}\nClick to dismiss, or right click to view inbox note.`
					: `${baseMessage}\nClick to dismiss.`;
				const notice = new InfoNotice(
					message,
					this.settings.noticeDurationSeconds ?? undefined
				);

				if (enableClickToView) {
					notice.noticeEl.oncontextmenu = () => {
						this.openInboxNote();
						notice.hide();
					};
				}
			}

			this.hasPerformedCheck = true;
			await this.saveSettings();
		} catch (error) {
			this.hasPerformedCheck = true;
			new ErrorNotice(`Failed to process inbox note/folder.\n${error}`);
		}
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

	async setInboxNote(file: MarkdownFileInfo | TFile) {
		if (file instanceof TFile) {
			this.settings.inboxNotePath = file.path;
			const contents = (await this.app.vault.read(file)).trim();
			this.settings.inboxNoteContents = contents;
		} else {
			if (!file.file || !file.editor) {
				new ErrorNotice(
					"Failed to set inbox note, no editor detected."
				);
				return;
			}

			this.settings.inboxNotePath = file.file.path;

			switch (this.settings.compareType) {
				case "compareToBase":
					this.settings.inboxNoteBaseContents =
						getValueFromMarkdownFileInfo(file);
					break;
				case "compareToLastTracked":
					this.settings.inboxNoteContents =
						getValueFromMarkdownFileInfo(file).trim();
					break;
			}
		}

		if (
			this.getIsWalkthroughViewOpen() &&
			this.settings.walkthroughStatus === WalkthroughStatuses.setInboxPath
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

	async setInboxFolder(folder: TFolder) {
		this.settings.inboxNotePath = folder.path;
		const filesInFolder = getAllFilesInFolderRecursive(folder);
		filesInFolder.sort((a, b) => a.localeCompare(b));
		this.settings.inboxFolderFiles.sort((a, b) => a.localeCompare(b));
		this.settings.inboxFolderFiles = filesInFolder;
		await this.saveSettings();

		new InfoNotice(
			`Inbox folder path set to ${this.settings.inboxNotePath}`
		);
	}
}
