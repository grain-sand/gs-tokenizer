import {RegexArrayStageBase} from "./RegexArrayStageBase";
import {TokenType} from "../../type";

export class UrlStage extends RegexArrayStageBase {

	readonly id = 'url';
	readonly order = 7;
	readonly priority = 1000;
	readonly skipOwnLastMax = true;
	readonly breakIfProcessed = true;
	mainGroup = 1;

	protected groupTypes: Record<number, TokenType> = {
		1: 'host',
		2: 'other',
		3: 'other',
		4: 'other',
	}

	protected groupSources?: Record<number, string> = {
		2: 'url-path',
		3: 'url-query-string',
		4: 'url-hash',
	}

	protected RegexArray: RegExp[] = [
		/^\s*(?:https?|ftp)?:[/]+((?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+|localhost)(?::\d{1,5})?((?:[/][^/?#\s]*)*\/?)(?:[?]([^#\s]*)*)?(?:#(\S*))?/i,
	];
}
