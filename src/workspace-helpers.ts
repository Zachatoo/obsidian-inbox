import { MarkdownView, WorkspaceLeaf, type Workspace } from "obsidian";

export function findMarkdownLeavesMatchingPath(
	workspace: Workspace,
	path: string
) {
	const results: WorkspaceLeaf[] = [];
	workspace.iterateAllLeaves((leaf) => {
		if (leaf.view instanceof MarkdownView) {
			const leafFilePath = leaf.getViewState().state?.file;
			if (leafFilePath && leafFilePath === path) {
				results.push(leaf);
			}
		}
	});
	return results;
}
