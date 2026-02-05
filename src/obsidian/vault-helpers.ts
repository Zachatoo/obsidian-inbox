import { TFolder, Vault } from "obsidian";

/** @deprecated Use vault.getAllFolders() */
export function getFolders(vault: Vault): TFolder[] {
	return vault.getAllFolders();
}
