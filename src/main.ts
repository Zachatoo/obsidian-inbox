import { Platform, Plugin, TFile, WorkspaceLeaf, TFolder } from "obsidian";
import { get } from "svelte/store";
import store from "./store";
import { getAllFilesInFolderRecursive } from "./obsidian/tabstractfile-helpers";
import { findMarkdownLeavesMatchingPath } from "./obsidian/workspace-helpers";
import { ErrorNotice, InfoNotice } from "./Notice";
import {
	DEFAULT_SETTINGS,
	isInboxPluginSettingsV2,
} from "./settings/InboxPluginSettingsV2";
import { migrateSettings } from "./settings/migrate-settings";
import { SettingsTab } from "./settings-tab/SettingsTab";
import {
	InboxWalkthroughView,
	VIEW_TYPE_WALKTHROUGH,
} from "./walkthrough/WalkthroughView";
import { WalkthroughStatuses } from "./walkthrough/WalkthroughStatus";
import { registerEvents } from "./register-events";

export default class InboxPlugin extends Plugin {
	hasPerformedCheck: boolean;

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

		registerEvents(this);

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
		let settings: unknown = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		settings = migrateSettings(settings);

		if (isInboxPluginSettingsV2(settings)) {
			store.set(settings);
		} else {
			new ErrorNotice(
				`Failed to load settings.\nSettings could not be migrated to match schema.\n${settings}`
			);
		}
	}

	ensureWalkthroughViewExists(active = false) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null;
		const existingPluginLeaves = workspace.getLeavesOfType(
			VIEW_TYPE_WALKTHROUGH
		);

		// There's already an existing leaf with our view, do not create leaf
		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0];
		} else {
			// View doesn't exist yet, reate it and make it visible
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				workspace.revealLeaf(leaf);
				leaf.setViewState({ type: VIEW_TYPE_WALKTHROUGH });
			}
		}

		if (active && leaf) {
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
			if (settings.inboxes.length > 0) {
				const updatedInboxes = await Promise.all(
					settings.inboxes.map(async (inbox, index) => {
						if (!inbox.path) {
							return inbox;
						}

						const inboxAbstractFile =
							this.app.vault.getAbstractFileByPath(inbox.path);
						if (!inboxAbstractFile) {
							new ErrorNotice(
								`Failed to find inbox ${inbox.trackingType.toString()} at path ${
									inbox.path
								}.`
							);
							return inbox;
						}

						let shouldNotify = false;
						if (inboxAbstractFile instanceof TFile) {
							const contents = (
								await this.app.vault.read(inboxAbstractFile)
							).trim();
							switch (inbox.compareType) {
								case "compareToBase":
									shouldNotify =
										contents !==
										inbox.inboxNoteBaseContents.trim();
									break;
								case "compareToLastTracked":
									shouldNotify =
										contents !==
										inbox.inboxNoteContents.trim();
									break;
								default:
									break;
							}
							inbox.inboxNoteContents = contents;
						} else if (inboxAbstractFile instanceof TFolder) {
							const filesInFolder =
								getAllFilesInFolderRecursive(inboxAbstractFile);
							filesInFolder.sort((a, b) => a.localeCompare(b));
							inbox.inboxFolderFiles.sort((a, b) =>
								a.localeCompare(b)
							);
							shouldNotify =
								filesInFolder.join("") !==
								inbox.inboxFolderFiles.join("");
							inbox.inboxFolderFiles = filesInFolder;
						}

						if (shouldNotify) {
							const enableClickToView =
								Platform.isDesktop &&
								inboxAbstractFile instanceof TFile;
							const baseMessage = `You have data to process in ${inbox.path}`;
							const message = enableClickToView
								? `${baseMessage}\nClick to dismiss, or right click to view inbox note.`
								: `${baseMessage}\nClick to dismiss.`;
							const notice = new InfoNotice(
								message,
								inbox.noticeDurationSeconds ?? undefined
							);

							if (enableClickToView) {
								notice.noticeEl.oncontextmenu = () => {
									this.ensureLeafAtPathIsActive(inbox.path);
									notice.hide();
								};
							}
						}
						return inbox;
					})
				);
				settings.inboxes = updatedInboxes;
				store.set(settings);
			}
		} catch (error) {
			new ErrorNotice(`Failed to process inboxes.\n${error}`);
		}
		this.hasPerformedCheck = true;
	}

	ensureLeafAtPathIsActive(path: string) {
		const leavesMatchingPath = findMarkdownLeavesMatchingPath(
			this.app.workspace,
			path
		);
		if (leavesMatchingPath.some(Boolean)) {
			this.app.workspace.setActiveLeaf(leavesMatchingPath[0], {
				focus: true,
			});
			return;
		}

		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			const leaf = this.app.workspace.getLeaf(true);
			leaf.openFile(file);
			return;
		}

		new ErrorNotice(`Failed to find note at path ${path}.`);
	}
}
