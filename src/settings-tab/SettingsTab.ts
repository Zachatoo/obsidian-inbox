import { App, PluginSettingTab } from "obsidian";
import type InboxPlugin from "src/main";
import { getFolders } from "src/obsidian/vault-helpers";
import SettingsTabComponent from "./SettingsTab.svelte";
import type { TrackingType } from "src/settings";

export class SettingsTab extends PluginSettingTab {
	plugin: InboxPlugin;
	component: SettingsTabComponent;

	constructor(app: App, plugin: InboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.component = new SettingsTabComponent({
			target: containerEl,
			props: {
				activateWalkthroughView: () => {
					this.plugin.ensureWalkthroughViewExists(true);
					this.app.setting.close();
				},
				setTrackingType: (trackingType: TrackingType) =>
					this.plugin.setTrackingType(trackingType),
				setInboxNote: (notePath) => this.plugin.setInboxNote(notePath),
				setInboxFolder: (folderPath) =>
					this.plugin.setInboxFolder(folderPath),
				markdownFiles: this.app.vault.getMarkdownFiles(),
				folders: getFolders(this.app.vault),
			},
		});
	}
}
