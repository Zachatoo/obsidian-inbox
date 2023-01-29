import { App, PluginSettingTab } from "obsidian";
import type InboxPlugin from "src/main";
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
		});
	}
}
