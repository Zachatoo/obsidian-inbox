export const WALKTHROUGH_STATUS_OPTIONS = [
	"unstarted",
	"setCompareType",
	"runSetInboxNoteCommand",
	"restartObsidian",
	"completed",
] as const;

export type WalkthroughStatus = typeof WALKTHROUGH_STATUS_OPTIONS[number];
