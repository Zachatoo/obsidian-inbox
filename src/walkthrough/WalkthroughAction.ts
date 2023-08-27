export enum WalkthroughActions {
	next = "next",
	previous = "previous",
}

export type WalkthroughAction = keyof typeof WalkthroughActions;
