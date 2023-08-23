export enum WalkthroughStatuses {
	unstarted = "unstarted",
	setCompareFileOrFolder = "setCompareFileOrFolder",
	setCompareType = "setCompareType",
	setInboxPath = "setInboxPath",
	restartObsidian = "restartObsidian",
	completed = "completed",
}

export type WalkthroughStatus = keyof typeof WalkthroughStatuses;
