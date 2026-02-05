import "obsidian";

declare module "obsidian" {
	interface MarkdownFileInfo {
		data: string | null | undefined;
	}

	interface App {
		setting: {
			open: () => void;
			close: () => void;
		};
	}
}
