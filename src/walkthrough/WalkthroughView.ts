import { ItemView, WorkspaceLeaf } from "obsidian";
import InboxWalkthroughComponent from "./WalkthroughView.svelte";
import type InboxPlugin from "src/main";
import { getFolders } from "src/obsidian/vault-helpers";

export const VIEW_TYPE_WALKTHROUGH = "inbox-walkthrough-view";

export class InboxWalkthroughView extends ItemView {
	component: InboxWalkthroughComponent;
	plugin: InboxPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: InboxPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_WALKTHROUGH;
	}

	getDisplayText() {
		return "Inbox Walkthrough";
	}

	getIcon() {
		return "info";
	}

	async onOpen() {
		this.component = new InboxWalkthroughComponent({
			target: this.contentEl,
			props: {
				app: this.app,
				closeWalkthroughView: () => this.closeWalkthroughView(),
				markdownFiles: this.app.vault.getMarkdownFiles(),
				folders: getFolders(this.app.vault),
			},
		});
	}

	async onClose() {
		this.component.$destroy();
	}

	closeWalkthroughView() {
		this.plugin.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);
	}
}
