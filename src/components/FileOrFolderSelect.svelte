<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Select } from "obsidian-svelte";

	export let value: string;

	const options = [
		{
			label: "Note",
			value: "note",
		},
		{
			label: "Folder",
			value: "folder",
		},
	];

	const dispatch = createEventDispatcher<{
		change: "note" | "folder";
	}>();
	function handleChange({ detail }: { detail: string }) {
		if (detail === "note" || detail === "folder") {
			dispatch("change", detail);
		}
	}
</script>

<Select {options} {value} on:change={handleChange} />
