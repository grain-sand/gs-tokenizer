import {RegexArrayStageBase} from "./RegexArrayStageBase";

export class IpStage extends RegexArrayStageBase {

	readonly id = 'ip';
	readonly order = 7;
	readonly priority = 100;
	readonly skipOwnLastMax = true;
	readonly breakIfProcessed = true;

	protected RegexArray: RegExp[] = [
		/^(?:\[[0-9a-fA-F:]*:[0-9a-fA-F:]+]|[0-9a-fA-F]*:[0-9a-fA-F:]+)(?::\d{1,5})?/,
		/^(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?/
	];
}
