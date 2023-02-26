import type { MarkdownFileInfo } from "obsidian";

export function getValueFromMarkdownFileInfo(
	fileInfo: MarkdownFileInfo
): string {
	// Prefer using editor from public api if available
	// Is not available if in preview mode in canvas
	if (fileInfo.editor) {
		return fileInfo.editor.getValue();
	}

	// Fallback to data not exposed in public api
	// Likely will not be hit
	return fileInfo.data ?? "";
}
