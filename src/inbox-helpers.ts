import { get } from "svelte/store";
import store from "./store";
import type { TrackingType } from "./settings/TrackingTypes";
import { ErrorNotice } from "./Notice";
import { App, TFile } from "obsidian";
import {
	getAllFilesInFolderRecursive,
	readFile,
} from "./obsidian/tabstractfile-helpers";
import { getFolders } from "./obsidian/vault-helpers";

export function setTrackingType(trackingType: TrackingType, index: number) {
	const settings = get(store);
	const matchingInbox = settings.inboxes.at(index);
	if (!matchingInbox) {
		new ErrorNotice(`Failed to find inbox at index ${index}.`);
		return;
	}
	matchingInbox.trackingType = trackingType;
	matchingInbox.path = "";
	store.set(settings);
}

export async function setInboxNote({
	app,
	notePath,
	index,
}: {
	app: App;
	notePath: string;
	index: number;
}) {
	const matchingFile = app.vault
		.getMarkdownFiles()
		.find((file) => file.path === notePath);
	if (!matchingFile || !(matchingFile instanceof TFile)) {
		new ErrorNotice(
			`Failed to set inbox note, ${notePath} could not be found or is not a note.`
		);
		return;
	}

	const settings = get(store);
	const matchingInbox = settings.inboxes.at(index);
	if (!matchingInbox) {
		new ErrorNotice(`Failed to find inbox at index ${index}.`);
		return;
	}

	matchingInbox.path = notePath;
	const contents = await readFile(app, matchingFile);
	matchingInbox.inboxNoteContents = contents;
	store.set(settings);
}

export async function setInboxFolder({
	app,
	folderPath,
	index,
}: {
	app: App;
	folderPath: string;
	index: number;
}) {
	const folder = getFolders(app.vault).find(
		(folder) => folder.path === folderPath
	);
	if (!folder) {
		new ErrorNotice(
			`Failed to set inbox folder, ${folderPath} could not be found.`
		);
		return;
	}

	const settings = get(store);
	const matchingInbox = settings.inboxes.at(index);
	if (!matchingInbox) {
		new ErrorNotice(`Failed to find inbox at index ${index}.`);
		return;
	}

	matchingInbox.path = folder.path;
	const filesInFolder = getAllFilesInFolderRecursive(folder);
	filesInFolder.sort((a, b) => a.localeCompare(b));
	matchingInbox.inboxFolderFiles.sort((a, b) => a.localeCompare(b));
	matchingInbox.inboxFolderFiles = filesInFolder;
	store.set(settings);
}
