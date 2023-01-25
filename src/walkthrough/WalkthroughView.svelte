<script lang="ts">
	import pluginStore, { step } from "src/store";
	import { WALKTHROUGH_STATUS_OPTIONS } from "./WalkthroughStatus";
	import { VIEW_TYPE_WALKTHROUGH } from "./WalkthroughView";

	function handleCloseWalkthrough() {
		$pluginStore.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);
		pluginStore.complete();
	}
</script>

<h1>Obsidian Inbox Walkthrough</h1>

<h2>Step {$step}</h2>

{#if $pluginStore.settings.walkthroughStatus === "unstarted"}
	<p>Looks like you haven't setup Obsidian Inbox yet! Let's get started!</p>

	<p>
		You can end this walkthrough by clicking
		<button on:click={handleCloseWalkthrough}>here</button>
	</p>

	<ol>
		<li>
			Open the note that you want to be your "Inbox" note. It can be
			called whatever you want, and can be anywhere in your vault.
		</li>
		<li>
			Set the default state of your inbox note. For example, if your note
			should just have a heading in it when you don't want a notification,
			add that heading to your note.
		</li>
		<li>
			Open the command palette with the keyboard shortcut <code
				>cmd p</code
			>
			(<code>ctrl p</code> on Windows) and run the "Set inbox note" command.
		</li>
	</ol>
{:else if $pluginStore.settings.walkthroughStatus === "ranSetInboxNoteCommand"}
	<p>Alright, let's verify that this is working.</p>

	<ol>
		<li>
			Restart Obsidian. You should <i>not</i> get a notification, since you
			haven't added anything to your "Inbox" note aside from anything added
			before you ran the "Set inbox note" command.
		</li>
		<li>Add anything to your "Inbox" note.</li>
		<li>
			Restart Obsidian. You <i>should</i> get a notification, because your
			"Inbox" note no longer matches what you set it to when you ran the "Set
			inbox note" command.
		</li>
	</ol>

	<p>Click the "Next" button below to continue.</p>
{:else if $pluginStore.settings.walkthroughStatus === "completed"}
	<p>You've completed the walkthrough!</p>

	<p>
		Feel free to close the walkthrough, or go back if you missed something!
		You can always re-open this walkthrough in the plugin settings.
	</p>
{/if}

<div class="flex">
	{#if $pluginStore.settings.walkthroughStatus !== WALKTHROUGH_STATUS_OPTIONS[0]}
		<button on:click={pluginStore.back}>Back</button>
	{/if}
	{#if $pluginStore.settings.walkthroughStatus !== WALKTHROUGH_STATUS_OPTIONS[WALKTHROUGH_STATUS_OPTIONS.length - 1]}
		<button class="flex ml-auto" on:click={pluginStore.next}>Next</button>
	{:else}
		<button class="flex ml-auto" on:click={handleCloseWalkthrough}>
			Close
		</button>
	{/if}
</div>

<style>
	.flex {
		display: flex;
	}
	.ml-auto {
		margin-left: auto;
	}
</style>
