<script lang="ts">
	import {
		Button,
		NumberInput,
		SettingItem,
		TextArea,
		TextInput,
	} from "obsidian-svelte";
	import store from "src/store";
	import { CompareTypeSelect } from "src/components";

	export let activateWalkthroughView: () => Promise<void>;

	async function startWalkthrough() {
		store.walkthrough.reset();
		await activateWalkthroughView();
	}
</script>

<h2>Walkthrough</h2>

<SettingItem
	name="Start walkthrough"
	description="This will open a pane in the sidebar to guide you through how to use this plugin."
>
	<Button variant="primary" on:click={startWalkthrough}>Start</Button>
</SettingItem>

<h2>Inbox Settings</h2>

<SettingItem
	name="Inbox path"
	description="Path for inbox note. Do not include .md at the end of the path."
>
	<TextInput
		placeholder="Inbox"
		value={$store.inboxNotePath}
		on:input={({ detail }) => {
			$store.inboxNotePath = detail;
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

<SettingItem
	name="Inbox notice duration"
	description="Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
>
	<NumberInput
		placeholder="0"
		value={$store.noticeDurationSeconds ?? null}
		on:input={({ detail }) => {
			$store.noticeDurationSeconds = detail ?? undefined;
		}}
	/>
</SettingItem>

<style>
	.hidden {
		display: none;
	}
</style>
