<script lang="ts">
	import type { TAbstractFile, TFolder } from "obsidian";
	import {
		Button,
		FileAutocomplete,
		NumberInput,
		SettingItem,
		TextArea,
	} from "obsidian-svelte";
	import store from "src/store";
	import { CompareTypeSelect } from "src/components";
	import FileOrFolderSelect from "src/components/FileOrFolderSelect.svelte";
	import type { TrackingType } from "src/settings";

	export let activateWalkthroughView: () => void;
	export let setTrackingType: (trackingType: TrackingType) => Promise<void>;
	export let setInboxNote: (notePath: string) => Promise<void>;
	export let setInboxFolder: (folderPath: string) => Promise<void>;
	export let markdownFiles: TAbstractFile[];
	export let folders: TFolder[];

	async function startWalkthrough() {
		store.walkthrough.start();
		activateWalkthroughView();
	}
</script>

<h2>Walkthrough</h2>

<SettingItem
	name="Start walkthrough"
	description="This will open a pane in the sidebar to guide you through how to use this plugin."
>
	<Button variant="primary" on:click={startWalkthrough}>Start</Button>
</SettingItem>

<h2>Tracking</h2>

<SettingItem
	name="Track note or folder"
	description="If tracking note, will notify when a note's content is updated. If tracking folder, will notify when new files are added to a folder."
>
	<FileOrFolderSelect
		value={$store.trackingType}
		on:change={async ({ detail }) => {
			if (detail !== $store.trackingType) {
				await setTrackingType(detail);
			}
		}}
	/>
</SettingItem>

<div class={$store.trackingType !== "note" ? "hidden" : ""}>
	<SettingItem name="Inbox path" description="Path for inbox note.">
		<FileAutocomplete
			placeholder="Inbox.md"
			value={$store.inboxNotePath}
			files={markdownFiles}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== $store.inboxNotePath) {
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
			value={$store.compareType}
			on:change={({ detail }) => {
				$store.compareType = detail;
			}}
		/>
	</SettingItem>

	<div class={$store.compareType !== "compareToBase" ? "hidden" : ""}>
		<SettingItem
			name="Inbox base contents"
			description="If note content matches this exactly, then you will not be notified."
		>
			<TextArea
				placeholder="# Inbox"
				value={$store.inboxNoteBaseContents}
				on:input={({ detail }) => {
					$store.inboxNoteBaseContents = detail;
				}}
				rows={3}
			/>
		</SettingItem>
	</div>
</div>

<div class={$store.trackingType !== "folder" ? "hidden" : ""}>
	<SettingItem name="Inbox path" description="Path for inbox folder.">
		<FileAutocomplete
			placeholder="Inbox"
			value={$store.inboxNotePath}
			files={folders}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== $store.inboxNotePath) {
					await setInboxFolder(detail);
				}
			}}
		/>
	</SettingItem>
</div>

<h2>Misc</h2>

<SettingItem
	name="Inbox notice duration"
	description="Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
>
	<NumberInput
		placeholder="0"
		value={$store.noticeDurationSeconds}
		on:input={({ detail }) => {
			$store.noticeDurationSeconds = detail;
		}}
	/>
</SettingItem>

<style>
	.hidden {
		display: none;
	}
</style>
