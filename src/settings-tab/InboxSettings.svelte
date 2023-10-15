<script lang="ts">
	import { TFile, type TAbstractFile, TFolder } from "obsidian";
	import {
		Button,
		FileAutocomplete,
		Icon,
		NumberInput,
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

	function moveInboxUp() {
		store.moveInboxUp(index);
	}

	function moveInboxDown() {
		store.moveInboxDown(index);
	}

	function removeInbox() {
		store.removeInbox(index);
	}
</script>

<div class="setting-item">
	<div class="setting-item-control inbox-setting-item-control">
		<FileOrFolderSelect
			value={inbox.trackingType}
			on:change={async ({ detail }) => {
				if (detail !== inbox.trackingType) {
					setTrackingType(detail);
				}
			}}
		/>

		{#if inbox.trackingType === "note"}
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

			<CompareTypeSelect
				value={inbox.compareType}
				on:change={({ detail }) => {
					$store.inboxes[index].compareType = detail;
				}}
			/>

			{#if inbox.compareType === "compareToBase"}
				<TextArea
					placeholder="# Inbox"
					value={inbox.inboxNoteBaseContents}
					on:input={({ detail }) => {
						$store.inboxes[index].inboxNoteBaseContents = detail;
					}}
					rows={1}
				/>
			{/if}
		{/if}

		{#if inbox.trackingType === "folder"}
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
		{/if}

		<input
			type="number"
			placeholder="0"
			aria-label="Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
			style="width: 40px;"
			bind:value={$store.inboxes[index].noticeDurationSeconds}
		/>

		<Button on:click={moveInboxUp}><Icon name="chevron-up" /></Button>
		<Button on:click={moveInboxDown}><Icon name="chevron-down" /></Button>
		<Button on:click={removeInbox}><Icon name="cross" /></Button>
	</div>
</div>

<style>
	.inbox-setting-item-control {
		justify-content: start;
		flex-wrap: wrap;
	}
</style>
