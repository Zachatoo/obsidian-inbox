<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Select } from "obsidian-svelte";

	export let value: string;

	const options = [
		{
			label: "Compare to last tracked",
			value: "compareToLastTracked",
		},
		{
			label: "Compare to base",
			value: "compareToBase",
		},
	];

	const dispatch = createEventDispatcher<{
		change: "compareToBase" | "compareToLastTracked";
	}>();
	function handleChange({ detail }: { detail: string }) {
		if (detail === "compareToBase" || detail === "compareToLastTracked") {
			dispatch("change", detail);
		}
	}
</script>

<Select
	{options}
	{value}
	tooltip="What to compare the inbox note contents to when deciding whether or not to notify. 'Compare to last tracked' will compare to a snapshot from when Obsidian was last closed. 'Compare to base' will compare to a base contents that you define."
	on:change={handleChange}
/>
