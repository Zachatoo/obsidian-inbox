import { App, PluginSettingTab, Setting } from "obsidian";
import InboxPlugin from "./main";

export class SettingsTab extends PluginSettingTab {
	plugin: InboxPlugin;

	constructor(app: App, plugin: InboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Inbox Settings" });

		new Setting(containerEl)
			.setName("Inbox path")
			.setDesc("Path for inbox note.")
			.addText((text) =>
				text
					.setPlaceholder("Inbox.md")
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
				"Duration to show Notice when there is data to process, in milliseconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
			)
			.addText((text) => {
				text.setPlaceholder("0")
					.setValue(
						this.plugin.settings.noticeDurationMs?.toString() ?? ""
					)
					.onChange(async (value) => {
						this.plugin.settings.noticeDurationMs =
							value !== "" ? Number(value) : undefined;
						await this.plugin.saveSettings();
					});
			});
	}
}
