import { TFolder, Vault } from "obsidian";

export function getFolders(vault: Vault): TFolder[] {
	return vault
		.getAllLoadedFiles()
		.filter((x): x is TFolder => x instanceof TFolder);
}
