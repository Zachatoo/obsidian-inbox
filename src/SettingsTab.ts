import { App, PluginSettingTab, Setting } from "obsidian";
import type InboxPlugin from "./main";

export class SettingsTab extends PluginSettingTab {
	plugin: InboxPlugin;

	constructor(app: App, plugin: InboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Walkthrough" });

		new Setting(containerEl)
			.setName("Start walkthrough")
			.setDesc(
				"This will open a pane in the sidebar to guide you through how to use this plugin."
			)
			.addButton((component) => {
				component
					.setButtonText("Start")
					.setCta()
					.onClick(async () => {
						this.plugin.settings.walkthroughStatus = "unstarted";
						await this.plugin.saveSettings();
						this.plugin.activateWalkthroughView();
					});
			});

		containerEl.createEl("h2", { text: "Inbox Settings" });

		new Setting(containerEl)
			.setName("Inbox path")
			.setDesc("Path for inbox note.")
			.addText((text) =>
				text
					.setPlaceholder("Inbox")
					.setValue(this.plugin.settings.inboxNotePath)
					.onChange(async (value) => {
						this.plugin.settings.inboxNotePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Inbox base contents")
			.setDesc(
				"If note content matches this exactly, then you will not be notified."
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("# Inbox\n")
					.setValue(this.plugin.settings.inboxNoteBaseContents)
					.onChange(async (value) => {
						this.plugin.settings.inboxNoteBaseContents = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Inbox notice duration")
			.setDesc(
				"Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
			)
			.addText((text) => {
				text.setPlaceholder("0")
					.setValue(
						this.plugin.settings.noticeDurationSeconds?.toString() ??
							""
					)
					.onChange(async (value) => {
						this.plugin.settings.noticeDurationSeconds =
							value !== "" ? Number(value) : undefined;
						await this.plugin.saveSettings();
					});
			});
	}
}
