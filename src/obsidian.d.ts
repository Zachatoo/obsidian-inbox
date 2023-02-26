import "obsidian";

declare module "obsidian" {
	interface Notice {
		noticeEl: HTMLElement;
	}

	interface MarkdownFileInfo {
		data: string | null | undefined;
	}
}
