<script lang="ts">
	import type { TAbstractFile, TFolder, App } from "obsidian";
	import { Button, FileAutocomplete, Icon, TextArea } from "obsidian-svelte";
	import store from "src/store";
	import { CompareTypeSelect } from "src/components";
	import FileOrFolderSelect from "src/components/FileOrFolderSelect.svelte";
	import type { Inbox } from "src/settings/Inbox";
	import {
		setInboxFolder,
		setInboxNote,
		setTrackingType,
	} from "src/inbox-helpers";

	export let inbox: Inbox;
	export let index: number;
	export let app: App;
	export let markdownFiles: TAbstractFile[];
	export let folders: TFolder[];

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
					setTrackingType(detail, index);
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
						await setInboxNote({ app, notePath: detail, index });
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
						await setInboxFolder({
							app,
							folderPath: detail,
							index,
						});
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
