import {INameLexiconGroup, IStageBestResult, IToken, ITokenizerStage, SupportedLanguage} from "../../type";

export abstract class NameStageBase implements ITokenizerStage {
	id: string;
	order = 2;
	priority = 0;

	protected last: string[];
	protected first: string[];
	protected title: string[];


	constructor(group: INameLexiconGroup, public lang: SupportedLanguage) {
		this.last = group.lastName;
		this.first = group.firstName;
		this.title = group.title;
		this.id = `name,${this.lang}`;
	}

	abstract all(rest: string): IToken[];

	abstract best(text: string, start: number): IStageBestResult;

}
