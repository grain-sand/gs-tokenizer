import {RegexArrayStageBase} from "./RegexArrayStageBase";


export class SpaceStage extends RegexArrayStageBase{

	readonly id = 'space';
	readonly order = 100;
	readonly priority = 0;

	protected RegexArray: RegExp[] = [
		/^\s+/,
	];
}
