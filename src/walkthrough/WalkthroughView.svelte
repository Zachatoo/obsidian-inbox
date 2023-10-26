<script lang="ts">
	import type { App, TFile, TFolder } from "obsidian";
	import { CompareTypeSelect } from "src/components";
	import store, { lastInbox, lastInboxIndex } from "src/store";
	import FileOrFolderSelect from "src/components/FileOrFolderSelect.svelte";
	import { WalkthroughStatuses } from "./WalkthroughStatus";
	import { TrackingTypes } from "src/settings/TrackingTypes";
	import { FileAutocomplete } from "obsidian-svelte";
	import {
		setInboxFolder,
		setInboxNote,
		setTrackingType,
	} from "src/inbox-helpers";

	export let app: App;
	export let closeWalkthroughView: () => void;
	export let markdownFiles: TFile[];
	export let folders: TFolder[];

	function handleCloseWalkthrough() {
		closeWalkthroughView();
		store.walkthrough.complete();
	}
</script>

<h1>Obsidian Inbox Walkthrough</h1>

{#if $store.walkthroughStatus === Object.values(WalkthroughStatuses)[1]}
	<p>Looks like you haven't setup Obsidian Inbox yet! Let's get started!</p>
{/if}

{#if $store.walkthroughStatus === WalkthroughStatuses.setCompareFileOrFolder}
	<p>
		Would you like to be notified when changes are made to a note, or when
		new files are added to a folder?
	</p>

	<FileOrFolderSelect
		value={$lastInbox.trackingType}
		on:change={async ({ detail }) => {
			if (detail !== $lastInbox.trackingType) {
				setTrackingType(detail, $lastInboxIndex);
			}
		}}
	/>
{:else if $store.walkthroughStatus === WalkthroughStatuses.setCompareType}
	<p>
		What would you like to compare your inbox note's contents to when
		deciding whether or not to show a notification on startup?
	</p>

	<CompareTypeSelect
		value={$lastInbox.compareType}
		on:change={({ detail }) => {
			$lastInbox.compareType = detail;
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
{:else if $store.walkthroughStatus === WalkthroughStatuses.setInboxPath}
	<p>
		Let's setup which {$lastInbox.trackingType.toString()} will be your inbox
		{$lastInbox.trackingType.toString()}.
	</p>

	{#if $lastInbox.trackingType === TrackingTypes.note}
		<p>
			Select the note that you want to be notified of when it's contents
			are changed.
		</p>
		<FileAutocomplete
			placeholder="Inbox.md"
			value={$lastInbox.path}
			files={markdownFiles}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== $lastInbox.path) {
					await setInboxNote({
						app,
						notePath: detail,
						index: $lastInboxIndex,
					});
				}
			}}
		/>
	{:else if $lastInbox.trackingType === TrackingTypes.folder}
		<p>
			Select the folder that you want to be notifified of when files are
			added/removed to this folder outside of Obsidian.
		</p>
		<FileAutocomplete
			placeholder="Inbox"
			value={$lastInbox.path}
			files={folders}
			getLabel={(file) => file.path}
			on:change={async ({ detail }) => {
				if (detail !== $lastInbox.path) {
					await setInboxFolder({
						app,
						folderPath: detail,
						index: $lastInboxIndex,
					});
				}
			}}
		/>
	{/if}
{:else if $store.walkthroughStatus === WalkthroughStatuses.restartObsidian}
	<p>Alright, let's verify that this is working.</p>

	{#if $lastInbox.trackingType === TrackingTypes.note && $lastInbox.compareType === "compareToBase"}
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
	{:else if $lastInbox.trackingType === TrackingTypes.note && $lastInbox.compareType === "compareToLastTracked"}
		<ol>
			<li>
				Restart Obsidian. You should <i>not</i> get a notification, since
				your Inbox note hasn't been updated externally.
			</li>
			<li>
				Close Obsidian, and add or remove some content to your Inbox
				note (located at "{$lastInbox.path}").
			</li>
			<li>
				Open Obsidian. You <i>should</i> get a notification, because your
				"Inbox" note was changed outside of Obsidian.
			</li>
		</ol>
	{:else if $lastInbox.trackingType === TrackingTypes.folder}
		<ol>
			<li>
				Restart Obsidian. You should <i>not</i> get a notification, since
				your Inbox folder hasn't been updated externally.
			</li>
			<li>
				Close Obsidian, and add or remove a note to your Inbox folder
				(located at "{$lastInbox.path}").
			</li>
			<li>
				Open Obsidian. You <i>should</i> get a notification, because your
				"Inbox" folder was changed outside of Obsidian.
			</li>
		</ol>
	{/if}

	<p>Click the "Next" button below to continue.</p>
{:else if $store.walkthroughStatus === WalkthroughStatuses.completed}
	<p>You've completed the walkthrough!</p>

	<p>
		Feel free to close the walkthrough, or go back if you missed something!
		You can always re-open this walkthrough in the plugin settings.
	</p>
{/if}

<div class="flex mt-1">
	{#if $store.walkthroughStatus !== Object.values(WalkthroughStatuses)[1]}
		<button on:click={store.walkthrough.previous}>Back</button>
	{/if}
	{#if $store.walkthroughStatus !== Object.values(WalkthroughStatuses)[Object.values(WalkthroughStatuses).length - 1]}
		<button class="flex ml-auto" on:click={store.walkthrough.next}>
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
	.mt-1 {
		margin-block-start: 1em;
	}
	.ml-auto {
		margin-left: auto;
	}
</style>
