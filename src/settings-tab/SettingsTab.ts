import { App, PluginSettingTab, SettingGroup } from "obsidian";
import { EditInboxModal } from "src/components/EditInboxModal";
import type InboxPlugin from "src/main";
import { DEFAULT_INBOX } from "src/settings/Inbox";
import { InboxPluginSettingsV2 } from "src/settings/InboxPluginSettingsV2";
import { WalkthroughStatuses } from "src/walkthrough/WalkthroughStatus";

export class SettingsTab extends PluginSettingTab {
	plugin: InboxPlugin;
	settings: InboxPluginSettingsV2;

	constructor(app: App, plugin: InboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.settings = plugin.settings;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new SettingGroup(containerEl).addSetting((setting) => {
			setting
				.setName("Start walkthrough")
				.setDesc(
					"Open a pane in the sidebar to guide you through how to use this plugin.",
				)
				.addButton((button) => {
					button.setButtonText("Start").onClick(async () => {
						this.settings.walkthroughStatus =
							WalkthroughStatuses.setCompareFileOrFolder;
						await this.plugin.saveSettings();
						this.plugin.ensureWalkthroughViewExists(true);
						this.app.setting.close();
					});
				});
		});

		const inboxesGroup = new SettingGroup(containerEl)
			.setHeading("Inboxes")
			.addExtraButton((button) => {
				button
					.setIcon("plus")
					.setTooltip("Add inbox")
					.onClick(() => {
						this.settings.inboxes.push({ ...DEFAULT_INBOX });
						this.plugin.saveSettings();
						this.display();
					});
			});

		this.settings.inboxes.forEach((inbox, index) => {
			inboxesGroup.addSetting((setting) => {
				setting
					.setName(inbox.path || "(no path set)")
					.setDesc(
						createFragment((frag) => {
							frag.appendText(
								`Tracking type: ${inbox.trackingType === "note" ? "Note" : "Folder"}`,
							);
							frag.appendChild(createEl("br"));
							if (inbox.trackingType === "note") {
								frag.appendText(
									`Compare type: ${inbox.compareType === "compareToLastTracked" ? "Compare to last tracked" : "Compare to base"}`,
								);
								frag.appendChild(createEl("br"));
							}
							if (inbox.noticeDurationSeconds === null) {
								frag.appendText(`Notice duration: Not set`);
							} else if (inbox.noticeDurationSeconds === 0) {
								frag.appendText(`Notice duration: Infinite`);
							} else {
								frag.appendText(
									`Notice duration: ${inbox.noticeDurationSeconds} seconds`,
								);
							}
						}),
					)
					.addExtraButton((button) => {
						button
							.setIcon("settings")
							.setTooltip("Edit inbox")
							.onClick(() => {
								new EditInboxModal(
									this.app,
									inbox,
									async (updatedInbox) => {
										this.settings.inboxes[index] =
											updatedInbox;
										await this.plugin.saveSettings();
										this.display();
									},
								).open();
							});
					})
					.addExtraButton((button) => {
						button
							.setIcon("arrow-up")
							.setTooltip("Move inbox up")
							.onClick(() => {
								const index =
									this.settings.inboxes.indexOf(inbox);
								if (index > 0) {
									this.settings.inboxes.splice(index, 1);
									this.settings.inboxes.splice(
										index - 1,
										0,
										inbox,
									);
									this.plugin.saveSettings();
									this.display();
								}
							});
					})
					.addExtraButton((button) => {
						button
							.setIcon("arrow-down")
							.setTooltip("Move inbox down")
							.onClick(() => {
								const index =
									this.settings.inboxes.indexOf(inbox);
								if (index < this.settings.inboxes.length - 1) {
									this.settings.inboxes.splice(index, 1);
									this.settings.inboxes.splice(
										index + 1,
										0,
										inbox,
									);
									this.plugin.saveSettings();
									this.display();
								}
							});
					})
					.addExtraButton((button) => {
						button
							.setIcon("trash")
							.setTooltip("Delete inbox")
							.setDisabled(this.settings.inboxes.length <= 1)
							.onClick(() => {
								this.settings.inboxes =
									this.settings.inboxes.filter(
										(i) => i !== inbox,
									);
								this.plugin.saveSettings();
								this.display();
							});
					});
			});
		});
	}
}
