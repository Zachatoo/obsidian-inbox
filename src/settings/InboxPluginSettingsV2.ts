import { DEFAULT_INBOX, type Inbox } from "./Inbox";
import type { WalkthroughStatus } from "../walkthrough/WalkthroughStatus";

export interface InboxPluginSettingsV2 {
	/**
	 * List of inboxes.
	 */
	inboxes: Inbox[];
	/**
	 * The current step of the walkthrough.
	 */
	walkthroughStatus: WalkthroughStatus;
}

export const DEFAULT_SETTINGS: InboxPluginSettingsV2 = Object.freeze({
	inboxes: [{ ...DEFAULT_INBOX }],
	walkthroughStatus: "unstarted",
});

export function isInboxPluginSettingsV2(
	obj: unknown
): obj is InboxPluginSettingsV2 {
	return !!(obj && typeof obj === "object" && "inboxes" in obj);
}
