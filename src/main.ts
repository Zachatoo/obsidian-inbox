import {
	Platform,
	Plugin,
	TFile,
	WorkspaceLeaf,
	type MarkdownFileInfo,
	TFolder,
} from "obsidian";
import { get } from "svelte/store";
import { getValueFromMarkdownFileInfo } from "./obsidian/markdown-file-info-helpers";
import { ErrorNotice, InfoNotice } from "./Notice";
import {
	DEFAULT_SETTINGS,
	migrateSettings,
	TrackingTypes,
	type TrackingType,
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
	private hasPerformedCheck: boolean;

	async onload() {
		this.hasPerformedCheck = false;
		await this.loadSettings();

		this.register(
			store.subscribe(async (settings) => {
				await this.saveData(settings);
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
				const settings = get(store);
				const { activeEditor: fileInfo } = app.workspace;
				if (
					settings.trackingType !== TrackingTypes.note ||
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
				const settings = get(store);
				if (
					this.hasPerformedCheck &&
					settings.trackingType === TrackingTypes.note &&
					file.path === settings.inboxNotePath
				) {
					settings.inboxNoteContents = data.trim();
					store.set(settings);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("create", async (file) => {
				const settings = get(store);
				if (
					this.hasPerformedCheck &&
					settings.trackingType === TrackingTypes.folder &&
					file.path.startsWith(settings.inboxNotePath)
				) {
					settings.inboxFolderFiles.push(file.name);
					settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					store.set(settings);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("rename", async (file, oldPath) => {
				const settings = get(store);
				if (
					this.hasPerformedCheck &&
					settings.trackingType === TrackingTypes.folder
				) {
					const oldName = oldPath.split("/").at(-1);
					settings.inboxFolderFiles = [
						...settings.inboxFolderFiles.filter(
							(x) => x !== oldName
						),
						file.name,
					];
					settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					store.set(settings);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("delete", async (file) => {
				const settings = get(store);
				if (
					this.hasPerformedCheck &&
					settings.trackingType === TrackingTypes.folder &&
					file.path.startsWith(settings.inboxNotePath)
				) {
					settings.inboxFolderFiles =
						settings.inboxFolderFiles.filter(
							(x) => x !== file.name
						);
					settings.inboxFolderFiles.sort((a, b) =>
						a.localeCompare(b)
					);
					store.set(settings);
				}
			})
		);

		this.addSettingTab(new SettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			const settings = get(store);
			if (settings.walkthroughStatus === WalkthroughStatuses.unstarted) {
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
		let settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		settings = migrateSettings(settings);

		store.set(settings);
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
		const settings = get(store);
		try {
			if (!settings.inboxNotePath) {
				return;
			}

			const inboxAbstractFile = this.app.vault.getAbstractFileByPath(
				settings.inboxNotePath
			);
			if (!inboxAbstractFile) {
				new ErrorNotice(
					`Failed to find inbox ${settings.trackingType.toString()} at path ${
						settings.inboxNotePath
					}.`
				);
				return;
			}

			let shouldNotify = false;
			if (inboxAbstractFile instanceof TFile) {
				const contents = (
					await this.app.vault.read(inboxAbstractFile)
				).trim();
				switch (settings.compareType) {
					case "compareToBase":
						shouldNotify =
							contents !== settings.inboxNoteBaseContents.trim();
						break;
					case "compareToLastTracked":
						shouldNotify =
							contents !== settings.inboxNoteContents.trim();
						break;
					default:
						break;
				}
				settings.inboxNoteContents = contents;
			} else if (inboxAbstractFile instanceof TFolder) {
				const filesInFolder =
					getAllFilesInFolderRecursive(inboxAbstractFile);
				filesInFolder.sort((a, b) => a.localeCompare(b));
				settings.inboxFolderFiles.sort((a, b) => a.localeCompare(b));
				shouldNotify =
					filesInFolder.join("") !==
					settings.inboxFolderFiles.join("");
				settings.inboxFolderFiles = filesInFolder;
			}

			if (shouldNotify) {
				const enableClickToView =
					Platform.isDesktop && inboxAbstractFile instanceof TFile;
				const baseMessage = `You have data to process in ${settings.inboxNotePath}`;
				const message = enableClickToView
					? `${baseMessage}\nClick to dismiss, or right click to view inbox note.`
					: `${baseMessage}\nClick to dismiss.`;
				const notice = new InfoNotice(
					message,
					settings.noticeDurationSeconds ?? undefined
				);

				if (enableClickToView) {
					notice.noticeEl.oncontextmenu = () => {
						this.openInboxNote();
						notice.hide();
					};
				}
			}

			this.hasPerformedCheck = true;
			store.set(settings);
		} catch (error) {
			this.hasPerformedCheck = true;
			new ErrorNotice(`Failed to process inbox note/folder.\n${error}`);
		}
	}

	openInboxNote() {
		const settings = get(store);
		const inboxNoteLeaves = findMarkdownLeavesMatchingPath(
			this.app.workspace,
			settings.inboxNotePath
		);
		if (inboxNoteLeaves.some(Boolean)) {
			this.app.workspace.setActiveLeaf(inboxNoteLeaves[0], {
				focus: true,
			});
			return;
		}

		const inboxNote = this.app.vault.getAbstractFileByPath(
			settings.inboxNotePath
		);
		if (inboxNote instanceof TFile) {
			const leaf = this.app.workspace.getLeaf(true);
			leaf.openFile(inboxNote);
			return;
		}

		new ErrorNotice(`Failed to find inbox note at path ${inboxNote}.`);
	}

	async setTrackingType(trackingType: TrackingType) {
		const settings = get(store);
		settings.trackingType = trackingType;
		settings.inboxNotePath = "";
		store.set(settings);
	}

	async setInboxNote(file: MarkdownFileInfo | TFile | string) {
		const settings = get(store);
		if (typeof file === "string") {
			const matchingFile = this.app.vault.getAbstractFileByPath(file);
			if (!matchingFile || !(matchingFile instanceof TFile)) {
				new ErrorNotice(
					`Failed to set inbox note, ${file} could not be found or is not a note.`
				);
				return;
			}
			settings.inboxNotePath = file;
			const contents = (await this.app.vault.read(matchingFile)).trim();
			settings.inboxNoteContents = contents;
		} else if (file instanceof TFile) {
			settings.inboxNotePath = file.path;
			const contents = (await this.app.vault.read(file)).trim();
			settings.inboxNoteContents = contents;
		} else {
			if (!file.file || !file.editor) {
				new ErrorNotice(
					"Failed to set inbox note, no editor detected."
				);
				return;
			}

			settings.inboxNotePath = file.file.path;

			switch (settings.compareType) {
				case "compareToBase":
					settings.inboxNoteBaseContents =
						getValueFromMarkdownFileInfo(file);
					break;
				case "compareToLastTracked":
					settings.inboxNoteContents =
						getValueFromMarkdownFileInfo(file).trim();
					break;
			}
		}

		if (
			this.getIsWalkthroughViewOpen() &&
			settings.walkthroughStatus === WalkthroughStatuses.setInboxPath
		) {
			store.walkthrough.next();
		}

		store.set(settings);

		let message = `Inbox note path set to ${settings.inboxNotePath}`;
		if (settings.compareType === "compareToBase") {
			message += `\nInbox note base contents set to\n${
				settings.inboxNoteBaseContents || "<blank>"
			}`;
		}
		new InfoNotice(message);
	}

	async setInboxFolder(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder || !(folder instanceof TFolder)) {
			new ErrorNotice(
				`Failed to set inbox folder, ${folderPath} could not be found or is not a folder.`
			);
			return;
		}
		const settings = get(store);
		settings.inboxNotePath = folder.path;
		const filesInFolder = getAllFilesInFolderRecursive(folder);
		filesInFolder.sort((a, b) => a.localeCompare(b));
		settings.inboxFolderFiles.sort((a, b) => a.localeCompare(b));
		settings.inboxFolderFiles = filesInFolder;
		store.set(settings);

		new InfoNotice(`Inbox folder path set to ${settings.inboxNotePath}`);
	}
}
