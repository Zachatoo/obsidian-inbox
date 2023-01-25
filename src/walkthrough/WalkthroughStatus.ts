export const WALKTHROUGH_STATUS_OPTIONS = [
	"unstarted",
	"ranSetInboxNoteCommand",
	"completed",
] as const;

export type WalkthroughStatus = typeof WALKTHROUGH_STATUS_OPTIONS[number];
