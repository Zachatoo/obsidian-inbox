import {
	TrackingTypes,
	type InboxPluginSettingsV2,
} from "src/settings/InboxPluginSettingsV2";
import {
	WalkthroughStatuses,
	type WalkthroughStatus,
} from "./WalkthroughStatus";
import {
	WalkthroughActions,
	type WalkthroughAction,
} from "./WalkthroughAction";

type Machine = {
	initial: WalkthroughStatus;
	states: {
		[Status in WalkthroughStatuses]: {
			[Action in WalkthroughAction]?:
				| WalkthroughStatus
				| { [Type in TrackingTypes]: WalkthroughStatus };
		};
	};
};

const machine: Machine = {
	initial: WalkthroughStatuses.unstarted,
	states: {
		[WalkthroughStatuses.unstarted]: {
			[WalkthroughActions.next]:
				WalkthroughStatuses.setCompareFileOrFolder,
		},
		[WalkthroughStatuses.setCompareFileOrFolder]: {
			[WalkthroughActions.next]: {
				[TrackingTypes.note]: WalkthroughStatuses.setCompareType,
				[TrackingTypes.folder]: WalkthroughStatuses.setInboxPath,
			},
		},
		[WalkthroughStatuses.setCompareType]: {
			[WalkthroughActions.previous]:
				WalkthroughStatuses.setCompareFileOrFolder,
			[WalkthroughActions.next]: WalkthroughStatuses.setInboxPath,
		},
		[WalkthroughStatuses.setInboxPath]: {
			[WalkthroughActions.previous]: {
				[TrackingTypes.note]: WalkthroughStatuses.setCompareType,
				[TrackingTypes.folder]:
					WalkthroughStatuses.setCompareFileOrFolder,
			},
			[WalkthroughActions.next]: WalkthroughStatuses.restartObsidian,
		},
		[WalkthroughStatuses.restartObsidian]: {
			[WalkthroughActions.previous]: WalkthroughStatuses.setInboxPath,
			[WalkthroughActions.next]: WalkthroughStatuses.completed,
		},
		[WalkthroughStatuses.completed]: {
			[WalkthroughActions.previous]: WalkthroughStatuses.restartObsidian,
		},
	},
};

export function transition(
	state: InboxPluginSettingsV2,
	action: WalkthroughAction
) {
	const to = machine.states[state.walkthroughStatus][action];
	if (typeof to === "string") {
		state.walkthroughStatus = to;
	} else if (typeof to === "object") {
		state.walkthroughStatus = to[state.trackingType];
	}
	return state;
}
