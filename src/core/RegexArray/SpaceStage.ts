import {BaseRegexArrayStage} from "./BaseRegexArrayStage";


export class SpaceStage extends BaseRegexArrayStage{

	readonly id = 'space';
	readonly order = 100;
	readonly priority = 0;

	protected RegexArray: RegExp[] = [
		/^\s+/,
	];
}
