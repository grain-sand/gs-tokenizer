import {BaseRegexArrayStage} from "./BaseRegexArrayStage";
import {TokenType} from "../../type";


export class PunctuationStage extends BaseRegexArrayStage {

	readonly id = 'punctuation';
	readonly order = 10;
	readonly priority = 0;
	readonly skipOwnLastMax = true;
	readonly breakIfProcessed = true;

	protected types: TokenType[] = ['emoji', 'punctuation'];

	protected RegexArray: RegExp[] = [
		/^\p{Emoji_Presentation}+/u,
		/^[^0-9A-Za-z\u4e00-\u9fff\s]+/,
	];
}
