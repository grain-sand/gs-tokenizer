import {SupportedLanguage} from "../type";

type LexiconMeta = {
	name: string;
	priority: number;
	lang?: SupportedLanguage;
};

export class WordIndex {
	private wordMap = new Map<string, LexiconMeta[]>();
	private firstCharIndex = new Map<string, Map<number, string[]>>();

	add(word: string, meta: LexiconMeta) {
		let metas = this.wordMap.get(word);
		if (!metas) {
			metas = [];
			this.wordMap.set(word, metas);
		}
		metas.push(meta);

		const ch = word[0];
		const len = word.length;

		let lenMap = this.firstCharIndex.get(ch);
		if (!lenMap) {
			lenMap = new Map();
			this.firstCharIndex.set(ch, lenMap);
		}

		let list = lenMap.get(len);
		if (!list) {
			list = [];
			lenMap.set(len, list);
		}
		list.push(word);
	}

	match(text: string, pos: number) {
		const ch = text[pos];
		const lenMap = this.firstCharIndex.get(ch);
		if (!lenMap) return [];

		const result: Array<{ word: string; meta: LexiconMeta }> = [];

		for (const [len, words] of lenMap) {
			const end = pos + len;
			if (end > text.length) continue;
			const slice = text.slice(pos, end);
			for (const w of words) {
				if (w === slice) {
					for (const m of this.wordMap.get(w)!) {
						result.push({ word: w, meta: m });
					}
				}
			}
		}
		return result;
	}
}
