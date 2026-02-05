import { AbstractInputSuggest, App, TFile } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<TFile> {
	allFiles: TFile[];

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.allFiles = app.vault.getMarkdownFiles();
	}

	getSuggestions(query: string) {
		return this.allFiles.filter((file) =>
			file.path.toLowerCase().includes(query.toLowerCase()),
		);
	}

	renderSuggestion(value: TFile, el: HTMLElement) {
		el.textContent = value.path;
	}
}
