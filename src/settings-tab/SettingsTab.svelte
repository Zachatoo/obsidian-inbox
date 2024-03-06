<script lang="ts">
	import type { App, TAbstractFile, TFolder } from "obsidian";
	import { Button, Icon, SettingItem } from "obsidian-svelte";
	import store from "src/store";
	import InboxSettings from "./InboxSettings.svelte";

	export let activateWalkthroughView: () => void;
	export let app: App;
	export let markdownFiles: TAbstractFile[];
	export let folders: TFolder[];

	async function startWalkthrough() {
		store.walkthrough.start();
		activateWalkthroughView();
	}

	function addInbox() {
		store.addInbox();
	}
</script>

<h2>Walkthrough</h2>

<SettingItem
	name="Start walkthrough"
	description="This will open a pane in the sidebar to guide you through how to use this plugin."
>
	<Button variant="primary" on:click={startWalkthrough}>Start</Button>
</SettingItem>

<div class="inbox-setting-heading-with-button">
	<h2>Inboxes</h2>

	<Button on:click={addInbox}><Icon name="plus" /></Button>
</div>

<div>
	{#each $store.inboxes as inbox, index}
		<InboxSettings {inbox} {index} {app} {markdownFiles} {folders} />
	{/each}
</div>

<style>
	.inbox-setting-heading-with-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
