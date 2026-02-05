import { AbstractInputSuggest, App, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	allFolders: TFolder[];

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.allFolders = app.vault.getAllFolders();
	}

	getSuggestions(query: string) {
		return this.allFolders.filter((folder) =>
			folder.path.toLowerCase().includes(query.toLowerCase()),
		);
	}

	renderSuggestion(value: TFolder, el: HTMLElement) {
		el.textContent = value.path;
	}
}
