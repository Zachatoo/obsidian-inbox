<script lang="ts">
	import { TFile, type TAbstractFile, TFolder } from "obsidian";
	import {
		Button,
		FileAutocomplete,
		NumberInput,
		SettingItem,
		TextArea,
	} from "obsidian-svelte";
	import { getAllFilesInFolderRecursive } from "src/obsidian/tabstractfile-helpers";
	import { get } from "svelte/store";
	import store from "src/store";
	import { CompareTypeSelect } from "src/components";
	import FileOrFolderSelect from "src/components/FileOrFolderSelect.svelte";
	import type { TrackingType } from "src/settings/TrackingTypes";
	import type { Inbox } from "src/settings/Inbox";
	import { ErrorNotice } from "src/Notice";

	export let inbox: Inbox;
	export let index: number;
	export let readFile: (file: TFile) => Promise<string>;
	export let markdownFiles: TAbstractFile[];
	export let folders: TFolder[];

	function setTrackingType(trackingType: TrackingType) {
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

	async function setInboxNote(notePath: string) {
		const matchingFile = markdownFiles.find(
			(file) => file.path === notePath
		);
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
		const contents = await readFile(matchingFile);
		matchingInbox.inboxNoteContents = contents;
		store.set(settings);
	}

	async function setInboxFolder(folderPath: string) {
		const folder = folders.find((folder) => folder.path === folderPath);
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
</script>

<SettingItem
	name="Track note or folder"
	description="If tracking note, will notify when a note's content is updated. If tracking folder, will notify when new files are added to a folder."
>
	<FileOrFolderSelect
		value={inbox.trackingType}
		on:change={async ({ detail }) => {
			if (detail !== inbox.trackingType) {
				setTrackingType(detail);
			}
		}}
	/>
</SettingItem>

<div class={inbox.trackingType !== "note" ? "hidden" : ""}>
	<SettingItem name="Inbox path" description="Path for inbox note.">
		<FileAutocomplete
			placeholder="Inbox.md"
			value={inbox.path}
			files={markdownFiles}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== inbox.path) {
					await setInboxNote(detail);
				}
			}}
		/>
	</SettingItem>

	<SettingItem
		name="Compare type"
		description="What to compare the inbox note contents to when deciding whether or not to notify. 'Compare to last tracked' will compare to a snapshot from when Obsidian was last closed. 'Compare to base' will compare to a base contents that you define."
	>
		<CompareTypeSelect
			value={inbox.compareType}
			on:change={({ detail }) => {
				inbox.compareType = detail;
			}}
		/>
	</SettingItem>

	<div class={inbox.compareType !== "compareToBase" ? "hidden" : ""}>
		<SettingItem
			name="Inbox base contents"
			description="If note content matches this exactly, then you will not be notified."
		>
			<TextArea
				placeholder="# Inbox"
				value={inbox.inboxNoteBaseContents}
				on:input={({ detail }) => {
					inbox.inboxNoteBaseContents = detail;
				}}
				rows={3}
			/>
		</SettingItem>
	</div>
</div>

<div class={inbox.trackingType !== "folder" ? "hidden" : ""}>
	<SettingItem name="Inbox path" description="Path for inbox folder.">
		<FileAutocomplete
			placeholder="Inbox"
			value={inbox.path}
			files={folders}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== inbox.path) {
					await setInboxFolder(detail);
				}
			}}
		/>
	</SettingItem>
</div>

<SettingItem
	name="Inbox notice duration"
	description="Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
>
	<NumberInput
		placeholder="0"
		value={inbox.noticeDurationSeconds}
		on:input={({ detail }) => {
			inbox.noticeDurationSeconds = detail;
		}}
	/>
</SettingItem>

<style>
	.hidden {
		display: none;
	}
</style>
