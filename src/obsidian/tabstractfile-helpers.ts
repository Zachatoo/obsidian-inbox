import { TFolder } from "obsidian";

export function getAllFilesInFolderRecursive(folder: TFolder): string[] {
	return folder.children.flatMap((child) => {
		if (child instanceof TFolder) {
			return getAllFilesInFolderRecursive(child);
		}
		return child.path;
	});
}
