import { App, TFile, TFolder } from "obsidian";

export function getAllFilesInFolderRecursive(folder: TFolder): string[] {
	return folder.children.flatMap((child) => {
		if (child instanceof TFolder) {
			return getAllFilesInFolderRecursive(child);
		}
		return child.path;
	});
}

export async function readFile(app: App, file: TFile): Promise<string> {
	return (await app.vault.read(file)).trim();
}
