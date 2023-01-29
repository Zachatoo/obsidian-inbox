<script lang="ts">
	import {
		Button,
		NumberInput,
		SettingItem,
		TextArea,
		TextInput,
	} from "obsidian-svelte";
	import pluginStore from "src/store";
	import { CompareTypeSelect } from "src/components";

	const compareTypeOptions = [
		{
			label: "Compare to last tracked",
			value: "compareToLastTracked",
		},
		{
			label: "Compare to base",
			value: "compareToBase",
		},
	];

	async function startWalkthrough() {
		pluginStore.walkthrough.reset();
		$pluginStore.activateWalkthroughView();
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
		value={$pluginStore.settings.inboxNotePath}
		on:input={({ detail }) => {
			$pluginStore.settings.inboxNotePath = detail;
			$pluginStore.saveSettings();
		}}
	/>
</SettingItem>

<SettingItem
	name="Compare type"
	description="What to compare the inbox note contents to when deciding whether or not to notify. 'Compare to last tracked' will compare to a snapshot from when Obsidian was last closed. 'Compare to base' will compare to a base contents that you define."
>
	<CompareTypeSelect
		value={$pluginStore.settings.compareType}
		on:change={({ detail }) => {
			$pluginStore.settings.compareType = detail;
			$pluginStore.saveSettings();
		}}
	/>
</SettingItem>

{#if $pluginStore.settings.compareType === "compareToBase"}
	<SettingItem
		name="Inbox base contents"
		description="If note content matches this exactly, then you will not be notified."
	>
		<TextArea
			placeholder="# Inbox\n"
			value={$pluginStore.settings.inboxNoteBaseContents}
			on:input={({ detail }) => {
				$pluginStore.settings.inboxNoteBaseContents = detail;
				$pluginStore.saveSettings();
			}}
			rows={3}
		/>
	</SettingItem>
{/if}

<SettingItem
	name="Inbox notice duration"
	description="Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration."
>
	<NumberInput
		placeholder="0"
		value={$pluginStore.settings.noticeDurationSeconds ?? null}
		on:input={({ detail }) => {
			$pluginStore.settings.noticeDurationSeconds = detail ?? undefined;
			$pluginStore.saveSettings();
		}}
	/>
</SettingItem>
