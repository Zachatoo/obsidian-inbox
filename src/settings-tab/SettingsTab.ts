import { App, PluginSettingTab } from "obsidian";
import type InboxPlugin from "src/main";
import { getFolders } from "src/obsidian/vault-helpers";
import SettingsTabComponent from "./SettingsTab.svelte";

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
				app: this.app,
				markdownFiles: this.app.vault.getMarkdownFiles(),
				folders: getFolders(this.app.vault),
			},
		});
	}
}
