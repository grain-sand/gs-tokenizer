import {RegexArrayStageBase} from "./RegexArrayStageBase";
import {FillCnNum} from "./NumberStage";


export class DateStage extends RegexArrayStageBase{

	readonly id = 'date';
	readonly order = 8;
	readonly priority = 0;


	protected RegexArray: RegExp[] = [
		/^(\d{4}年)\s*(\d{1,2}月)\s*(\d{1,2}日)/,
		new RegExp(`^([${FillCnNum}]{4}年)\s*([${FillCnNum}]{1,2}月)\s*([${FillCnNum}]{1,2}日)`),
		/^(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})/,
		/^(\d{1,2})\s*[-/.](\d{1,2})\s*[-/.]\s*(\d{4})/,
		/^(?:\d{4}年|d{1,2}[月日])/,
		new RegExp(`^(?:[${FillCnNum}]{4}年|[${FillCnNum}]{1,2}[月日])`),
	];
}


