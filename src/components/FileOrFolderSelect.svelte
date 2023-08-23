<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Select } from "obsidian-svelte";

	export let value: string;

	const options = [
		{
			label: "File",
			value: "file",
		},
		{
			label: "Folder",
			value: "folder",
		},
	];

	const dispatch = createEventDispatcher<{
		change: "file" | "folder";
	}>();
	function handleChange({ detail }: { detail: string }) {
		if (detail === "file" || detail === "folder") {
			dispatch("change", detail);
		}
	}
</script>

<Select {options} {value} on:change={handleChange} />
