<script lang="ts">
	import type { TAbstractFile, TFile, TFolder } from "obsidian";
	import { Button, SettingItem } from "obsidian-svelte";
	import store from "src/store";
	import InboxSettings from "./InboxSettings.svelte";

	export let activateWalkthroughView: () => void;
	export let readFile: (file: TFile) => Promise<string>;
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

<h2>Inboxes</h2>

{#each $store.inboxes as inbox, index}
	<InboxSettings {inbox} {index} {readFile} {markdownFiles} {folders} />
{/each}
