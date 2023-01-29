<script lang="ts">
	import { CompareTypeSelect } from "src/components";
	import pluginStore, { currentWalkthroughStep } from "src/store";
	import { WALKTHROUGH_STATUS_OPTIONS } from "./WalkthroughStatus";
	import { VIEW_TYPE_WALKTHROUGH } from "./WalkthroughView";

	function handleCloseWalkthrough() {
		$pluginStore.app.workspace.detachLeavesOfType(VIEW_TYPE_WALKTHROUGH);
		pluginStore.walkthrough.complete();
	}
</script>

<h1>Obsidian Inbox Walkthrough</h1>

<h2>Step {$currentWalkthroughStep}</h2>

{#if $pluginStore.settings.walkthroughStatus === "setCompareType"}
	<p>Looks like you haven't setup Obsidian Inbox yet! Let's get started!</p>

	<p>
		What would you like to compare your inbox note's contents to when
		deciding whether or not to show a notification on startup?
	</p>

	<CompareTypeSelect
		value={$pluginStore.settings.compareType}
		on:change={({ detail }) => {
			$pluginStore.settings.compareType = detail;
			$pluginStore.saveSettings();
		}}
	/>

	<p>
		'Compare to last tracked' will compare to a snapshot from when Obsidian
		was last closed. This is the default, and is most commonly used when you
		want to know if a note was changes externally outside of Obsidian.
	</p>
	<p>
		'Compare to base' will compare to a base contents that you define. This
		is used for when you want to know if there's anything in your inbox
		note, even if there haven't been any changes to your note since your
		last startup.
	</p>
{:else if $pluginStore.settings.walkthroughStatus === "runSetInboxNoteCommand"}
	<p>Let's setup which note will be your inbox note.</p>

	<ol>
		<li>
			Open the note that you want to be your "Inbox" note. It can be
			called whatever you want, and can be anywhere in your vault.
		</li>
		{#if $pluginStore.settings.compareType === "compareToBase"}
			<li>
				Set the default state of your inbox note. For example, if your
				note should just have a heading in it when you don't want a
				notification, add that heading to your note.
			</li>
		{/if}
		<li>
			Open the command palette with the keyboard shortcut
			<code>cmd p</code>
			(<code>ctrl p</code> on Windows) and run the "Set inbox note" command.
		</li>
	</ol>
{:else if $pluginStore.settings.walkthroughStatus === "restartObsidian"}
	<p>Alright, let's verify that this is working.</p>

	{#if $pluginStore.settings.compareType === "compareToBase"}
		<ol>
			<li>
				Restart Obsidian. You should <i>not</i> get a notification, since
				you haven't added anything to your "Inbox" note aside from anything
				added before you ran the "Set inbox note" command.
			</li>
			<li>Add anything to your "Inbox" note.</li>
			<li>
				Restart Obsidian. You <i>should</i> get a notification, because your
				"Inbox" note no longer matches what you set it to when you ran the
				"Set inbox note" command.
			</li>
		</ol>
	{/if}
	{#if $pluginStore.settings.compareType === "compareToLastTracked"}
		<ol>
			<li>
				Restart Obsidian. You should <i>not</i> get a notification, since
				your Inbox note hasn't been updated externally.
			</li>
			<li>
				Close Obsidian, and add or remove some content to your Inbox
				note (located at "{$pluginStore.settings.inboxNotePath}.md").
			</li>
			<li>
				Open Obsidian. You <i>should</i> get a notification, because your
				"Inbox" note was changed outside of Obsidian.
			</li>
		</ol>
	{/if}

	<p>Click the "Next" button below to continue.</p>
{:else if $pluginStore.settings.walkthroughStatus === "completed"}
	<p>You've completed the walkthrough!</p>

	<p>
		Feel free to close the walkthrough, or go back if you missed something!
		You can always re-open this walkthrough in the plugin settings.
	</p>
{/if}

<div class="flex">
	{#if $pluginStore.settings.walkthroughStatus !== WALKTHROUGH_STATUS_OPTIONS[1]}
		<button on:click={pluginStore.walkthrough.back}>Back</button>
	{/if}
	{#if $pluginStore.settings.walkthroughStatus !== WALKTHROUGH_STATUS_OPTIONS[WALKTHROUGH_STATUS_OPTIONS.length - 1]}
		<button class="flex ml-auto" on:click={pluginStore.walkthrough.next}>
			Next
		</button>
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
