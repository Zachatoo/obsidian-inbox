import { App, Modal, normalizePath, Setting } from "obsidian";
import { Inbox } from "src/settings/Inbox";
import { FileSuggest } from "./FileSuggest";
import { FolderSuggest } from "./FolderSuggest";

export class EditInboxModal extends Modal {
	inbox: Inbox;
	onSubmit: (updatedInbox: Inbox) => Promise<void> | void;

	constructor(
		app: App,
		inbox: Inbox,
		onSubmit: (updatedInbox: Inbox) => Promise<void> | void,
	) {
		super(app);
		this.setTitle("Edit inbox");
		this.inbox = inbox;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		this.display();
	}

	display() {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl)
			.setName("Tracking type")
			.setDesc(
				"Would you like to be notified when changes are made to a note, or when new files are added to a folder?",
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("note", "Note")
					.addOption("folder", "Folder")
					.setValue(this.inbox.trackingType)
					.onChange((value: "note" | "folder") => {
						this.inbox.trackingType = value;
						this.display();
					});
			});

		if (this.inbox.trackingType === "note") {
			new Setting(contentEl)
				.setName("Note path")
				.setDesc(
					"Select the note that you want to be notified of when it's contents are changed.",
				)
				.addText((text) => {
					text.setValue(this.inbox.path).onChange((value) => {
						this.inbox.path = normalizePath(value);
					});
					const suggest = new FileSuggest(
						this.app,
						text.inputEl,
					).onSelect((file) => {
						this.inbox.path = normalizePath(file.path);
						text.setValue(this.inbox.path);
						suggest.close();
					});
				});

			new Setting(contentEl)
				.setName("Compare type")
				.setDesc(
					createFragment((frag) => {
						frag.appendText(
							"What would you like to compare your inbox note's contents to when deciding whether or not to show a notification on startup?",
						);
						frag.appendChild(createEl("br"));
						frag.appendChild(createEl("br"));
						frag.appendText(
							"'Compare to last tracked' will compare to a snapshot from when Obsidian was last closed. This is the default, and is most commonly used when you want to know if a note was changes externally outside of Obsidian.",
						);
						frag.appendChild(createEl("br"));
						frag.appendChild(createEl("br"));
						frag.appendText(
							"'Compare to base' will compare to a base contents that you define. This is used for when you want to know if there's anything in your inbox note, even if there haven't been any changes to your note since your last startup.",
						);
					}),
				)
				.addDropdown((dropdown) => {
					dropdown
						.addOption(
							"compareToLastTracked",
							"Compare to last tracked",
						)
						.addOption("compareToBase", "Compare to base")
						.setValue(this.inbox.compareType)
						.onChange(
							(
								value: "compareToBase" | "compareToLastTracked",
							) => {
								this.inbox.compareType = value;
								this.display();
							},
						);
				});

			if (this.inbox.compareType === "compareToBase") {
				new Setting(contentEl)
					.setName("Inbox note base contents")
					.setDesc(
						"The base contents that your inbox note will be compared to when deciding whether or not to show a notification on startup.",
					)
					.addTextArea((text) => {
						text.setValue(
							this.inbox.inboxNoteBaseContents,
						).onChange((value) => {
							this.inbox.inboxNoteBaseContents = value;
						});
					});
			}
		} else if (this.inbox.trackingType === "folder") {
			new Setting(contentEl)
				.setName("Folder path")
				.setDesc(
					"Select the folder that you want to be notifified of when files are added/removed to this folder outside of Obsidian.",
				)
				.addText((text) => {
					text.setValue(this.inbox.path).onChange((value) => {
						this.inbox.path = normalizePath(value);
					});
					const suggest = new FolderSuggest(
						this.app,
						text.inputEl,
					).onSelect((file) => {
						this.inbox.path = normalizePath(file.path);
						text.setValue(this.inbox.path);
						suggest.close();
					});
				});
		}

		new Setting(contentEl)
			.setName("Notice duration")
			.setDesc(
				"Duration to show notification when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration.",
			)
			.addText((text) => {
				text.inputEl.type = "number";
				text.setValue(
					this.inbox.noticeDurationSeconds !== null
						? this.inbox.noticeDurationSeconds.toString()
						: "",
				).onChange((value) => {
					const parsed = parseInt(value, 10);
					if (isNaN(parsed)) {
						this.inbox.noticeDurationSeconds = null;
					} else {
						this.inbox.noticeDurationSeconds = parsed;
					}
				});
			});
	}
}
