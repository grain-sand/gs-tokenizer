import {IToken} from "../../type";

export function tokenText(tokens: IToken[]): string[] {
	return Array.from(new Set(tokens.filter(t=>{
		if(t.type==='punctuation') {
			return t.txt.length>1;
		}
		return t.type !== 'space';
	}).map(t=>t.txt)));
}
