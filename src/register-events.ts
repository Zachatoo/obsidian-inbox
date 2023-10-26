import { get } from "svelte/store";
import type InboxPlugin from "./main";
import store from "./store";
import { TrackingTypes } from "./settings/TrackingTypes";

export function registerEvents(plugin: InboxPlugin) {
	plugin.registerEvent(
		plugin.app.metadataCache.on("changed", async (file, data, cache) => {
			const settings = get(store);
			if (plugin.hasPerformedCheck) {
				const matchingInboxes = settings.inboxes.filter(
					(inbox) =>
						inbox.trackingType === TrackingTypes.note &&
						inbox.path === file.path
				);
				if (matchingInboxes.length > 0) {
					for (const inbox of matchingInboxes) {
						inbox.inboxNoteContents = data.trim();
					}
					store.set(settings);
				}
			}
		})
	);

	plugin.registerEvent(
		plugin.app.vault.on("create", async (file) => {
			const settings = get(store);
			if (plugin.hasPerformedCheck) {
				const matchingInboxes = settings.inboxes.filter(
					(inbox) =>
						inbox.trackingType === TrackingTypes.folder &&
						file.path.startsWith(inbox.path)
				);
				if (matchingInboxes.length > 0) {
					for (const inbox of matchingInboxes) {
						inbox.inboxFolderFiles.push(file.name);
						inbox.inboxFolderFiles.sort((a, b) =>
							a.localeCompare(b)
						);
					}
					store.set(settings);
				}
			}
		})
	);

	plugin.registerEvent(
		plugin.app.vault.on("rename", async (file, oldPath) => {
			const settings = get(store);
			if (plugin.hasPerformedCheck) {
				const oldName = oldPath.split("/").at(-1);
				const matchingInboxes = settings.inboxes.filter(
					(inbox) =>
						inbox.trackingType === TrackingTypes.folder &&
						inbox.inboxFolderFiles.includes(file.name)
				);
				if (matchingInboxes.length > 0) {
					for (const inbox of matchingInboxes) {
						inbox.inboxFolderFiles = [
							...inbox.inboxFolderFiles.filter(
								(x) => x !== oldName
							),
							file.name,
						];
						inbox.inboxFolderFiles.sort((a, b) =>
							a.localeCompare(b)
						);
					}
					store.set(settings);
				}
			}
		})
	);

	plugin.registerEvent(
		plugin.app.vault.on("delete", async (file) => {
			const settings = get(store);
			if (plugin.hasPerformedCheck) {
				const matchingInboxes = settings.inboxes.filter(
					(inbox) =>
						inbox.trackingType === TrackingTypes.folder &&
						file.path.startsWith(inbox.path)
				);
				if (matchingInboxes.length > 0) {
					for (const inbox of matchingInboxes) {
						inbox.inboxFolderFiles = inbox.inboxFolderFiles.filter(
							(x) => x !== file.name
						);
						inbox.inboxFolderFiles.sort((a, b) =>
							a.localeCompare(b)
						);
					}
					store.set(settings);
				}
			}
		})
	);
}
