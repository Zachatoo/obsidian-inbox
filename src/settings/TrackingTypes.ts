export enum TrackingTypes {
	note = "note",
	folder = "folder",
}

export type TrackingType = keyof typeof TrackingTypes;
