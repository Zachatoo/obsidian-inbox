import { describe, expect, test } from "vitest";
import { migrateSettings } from "./migrate-settings";
import type { InboxPluginSettingsV1 } from "./InboxPluginSettingsV1";
import type { InboxPluginSettingsV2 } from "./InboxPluginSettingsV2";

describe("migrateSettings", () => {
	test("migrates V1 to V2", () => {
		const mockSettings: InboxPluginSettingsV1 = {
			trackingType: "note",
			inboxNotePath: "Mobile Inbox.md",
			compareType: "compareToLastTracked",
			inboxNoteBaseContents: "",
			inboxNoteContents: "Contents",
			inboxFolderFiles: [],
			noticeDurationSeconds: 1,
			walkthroughStatus: "completed",
		};
		const expectedResult: InboxPluginSettingsV2 = {
			inboxes: [
				{
					trackingType: "note",
					path: "Mobile Inbox.md",
					compareType: "compareToLastTracked",
					inboxNoteBaseContents: "",
					inboxNoteContents: "Contents",
					inboxFolderFiles: [],
					noticeDurationSeconds: 1,
				},
			],
			walkthroughStatus: "completed",
		};
		const result = migrateSettings(mockSettings);
		expect(result).toEqual(expectedResult);
	});

	test("migrates V1 missing .md extension to V2", () => {
		const mockSettings: InboxPluginSettingsV1 = {
			trackingType: "note",
			inboxNotePath: "Mobile Inbox",
			compareType: "compareToLastTracked",
			inboxNoteBaseContents: "",
			inboxNoteContents: "Contents",
			inboxFolderFiles: [],
			noticeDurationSeconds: 1,
			walkthroughStatus: "completed",
		};
		const expectedResult: InboxPluginSettingsV2 = {
			inboxes: [
				{
					trackingType: "note",
					path: "Mobile Inbox.md",
					compareType: "compareToLastTracked",
					inboxNoteBaseContents: "",
					inboxNoteContents: "Contents",
					inboxFolderFiles: [],
					noticeDurationSeconds: 1,
				},
			],
			walkthroughStatus: "completed",
		};
		const result = migrateSettings(mockSettings);
		expect(result).toEqual(expectedResult);
	});

	test("migrates V1 with folder tracking to V2", () => {
		const mockSettings: InboxPluginSettingsV1 = {
			trackingType: "folder",
			inboxNotePath: "Inbox Folder",
			compareType: "compareToLastTracked",
			inboxNoteBaseContents: "",
			inboxNoteContents: "",
			inboxFolderFiles: ["file1", "file2"],
			noticeDurationSeconds: 1,
			walkthroughStatus: "completed",
		};
		const expectedResult: InboxPluginSettingsV2 = {
			inboxes: [
				{
					trackingType: "folder",
					path: "Inbox Folder",
					compareType: "compareToLastTracked",
					inboxNoteBaseContents: "",
					inboxNoteContents: "",
					inboxFolderFiles: ["file1", "file2"],
					noticeDurationSeconds: 1,
				},
			],
			walkthroughStatus: "completed",
		};
		const result = migrateSettings(mockSettings);
		expect(result).toEqual(expectedResult);
	});

	test("leaves V2 settings intact", () => {
		const mockSettings: InboxPluginSettingsV2 = {
			inboxes: [
				{
					trackingType: "folder",
					path: "Inbox Folder",
					compareType: "compareToLastTracked",
					inboxNoteBaseContents: "",
					inboxNoteContents: "",
					inboxFolderFiles: ["file1", "file2"],
					noticeDurationSeconds: 1,
				},
			],
			walkthroughStatus: "completed",
		};
		const result = migrateSettings(mockSettings);
		expect(result).toEqual(mockSettings);
	});
});
