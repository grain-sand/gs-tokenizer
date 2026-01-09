import {BaseRegexArrayStage} from "./BaseRegexArrayStage";

export class IpStage extends BaseRegexArrayStage {

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
