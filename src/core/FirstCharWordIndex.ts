import {IToken, IWordIndex, IWordMatch, LexiconMeta} from "../type";

export class FirstCharWordIndex implements IWordIndex {

	// 使用普通对象
	#wordMap: Record<string, LexiconMeta> = {};
	#firstCharIndex: Record<string, Record<number, string[]>> = {};

	add(word: string, meta: LexiconMeta) {
		this.addBatch([{word, meta}]);
	}

	// 批量添加单词，确保原子性
	addBatch(words: { word: string; meta: LexiconMeta }[]) {

		// 创建临时副本，确保原子更新
		const tempWordMap = {...this.#wordMap};
		const tempFirstCharIndex: Record<string, Record<number, string[]>> = {};

		// 复制现有数据到临时副本
		for (const ch in this.#firstCharIndex) {
			if (Object.prototype.hasOwnProperty.call(this.#firstCharIndex, ch)) {
				tempFirstCharIndex[ch] = {};
				for (const len in this.#firstCharIndex[ch]) {
					if (Object.prototype.hasOwnProperty.call(this.#firstCharIndex[ch], len)) {
						// 深拷贝单词列表
						tempFirstCharIndex[ch][+len] = [...this.#firstCharIndex[ch][+len]];
					}
				}
			}
		}

		// 批量添加单词到临时副本
		for (const {word, meta} of words) {
			const ch = word[0];
			const len = word.length;

			// 更新临时词库映射
			tempWordMap[word] = meta;

			// 更新临时首字符索引
			if (!tempFirstCharIndex[ch]) {
				tempFirstCharIndex[ch] = {};
			}

			if (!tempFirstCharIndex[ch][len]) {
				tempFirstCharIndex[ch][len] = [];
			}

			// 检查单词是否已存在，避免重复添加
			const wordList = tempFirstCharIndex[ch][len];
			if (!wordList.includes(word)) {
				wordList.push(word);
			}
		}

		// 原子性替换现有数据
		this.#wordMap = tempWordMap;
		this.#firstCharIndex = tempFirstCharIndex;
	}

	match(text: string, pos: number) {
		// 处理空字符串或超出范围的情况
		if (pos >= text.length) {
			return [];
		}

		const ch = text[pos];
		const lenMap = this.#firstCharIndex[ch];
		const result: Array<IWordMatch> = [];

		if (lenMap) {
			for (const len in lenMap) {
				const words = lenMap[+len];
				const end = pos + +len;
				if (end > text.length) continue;
				const slice = text.slice(pos, end);
				for (const w of words) {
					if (w === slice) {
						result.push({word: w, meta: this.#wordMap[w]});
					}
				}
			}
		}

		return result;
	}

	matches(text: string): IToken[] {
		// 只获取文本开头的所有匹配结果
		const matches = this.match(text, 0);

		// 将所有匹配转换为token并返回
		return matches.map(match => ({
			txt: match.word,
			type: 'word',
			supLang: match.meta.lang,
			src: match.meta.name
		}));
	}
}
