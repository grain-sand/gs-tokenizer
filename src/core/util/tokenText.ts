import {IToken} from "../../type";

export function tokenText(tokens: IToken[]): string[] {
	return tokens.filter(t=>{
		if(t.type==='punctuation') {
			return t.txt.length>1;
		}
		return t.type !== 'space';
	}).map(t=>t.txt);
}
