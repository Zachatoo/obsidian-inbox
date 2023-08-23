import { TFolder, type TAbstractFile, TFile, Vault } from "obsidian";

export function getMarkdownFilesAndFolders(vault: Vault): TAbstractFile[] {
	return vault.getAllLoadedFiles().filter((x) => {
		if (x instanceof TFolder) {
			return true;
		}
		if (x instanceof TFile) {
			return x.extension === "md";
		}
		return false;
	});
}

export function getFolders(vault: Vault): TFolder[] {
	return vault
		.getAllLoadedFiles()
		.filter((x): x is TFolder => x instanceof TFolder);
}
