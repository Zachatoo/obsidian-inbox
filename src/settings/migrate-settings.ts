import type { Inbox } from "./Inbox";
import {
	isInboxPluginSettingsV1,
	type InboxPluginSettingsV1,
} from "./InboxPluginSettingsV1";
import {
	isInboxPluginSettingsV2,
	type InboxPluginSettingsV2,
} from "./InboxPluginSettingsV2";

/**
 * Handles any backwards incompatible changes to the settings schema.
 * @param settings The plugin settings.
 * @returns The plugin settings with any migrations applied.
 */
export function migrateSettings(
	settings: unknown
): InboxPluginSettingsV2 | undefined {
	if (isInboxPluginSettingsV1(settings)) {
		// If tracking by file, the file path must end with .md
		if (
			settings.trackingType === "note" &&
			settings.inboxNotePath &&
			!settings.inboxNotePath.endsWith(".md")
		) {
			settings.inboxNotePath += ".md";
		}
		settings = migrateV1ToV2(settings);
	}

	if (isInboxPluginSettingsV2(settings)) {
		return settings;
	}
}

function migrateV1ToV2(settings: InboxPluginSettingsV1): InboxPluginSettingsV2 {
	const inbox: Inbox = { ...settings, path: settings.inboxNotePath };
	if ("inboxNotePath" in inbox) {
		delete inbox.inboxNotePath;
	}
	if ("walkthroughStatus" in inbox) {
		delete inbox.walkthroughStatus;
	}
	return {
		inboxes: [inbox],
		walkthroughStatus: settings.walkthroughStatus,
	};
}
