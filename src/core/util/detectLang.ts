import {Lang} from "../../type";

export function detectLang(str: string, fastCJK = true): Lang {
	let lang: Lang = Lang.NONE;

	for (let i = 0; i < str.length;) {
		const cp = str.codePointAt(i)!;

		if (cp <= 0x7f) {
			lang = lang === Lang.NONE ? Lang.EN : lang;
			i++;
			continue;
		}

		if (
			(cp >= 0x4e00 && cp <= 0x9fff) || // 汉字
			(cp >= 0x3400 && cp <= 0x4dbf) || // 汉字扩展A
			(cp >= 0x3040 && cp <= 0x30ff) || // 日文假名
			(cp >= 0xac00 && cp <= 0xd7af)    // 韩文
		) {
			if (fastCJK) return Lang.CJK;
			if (lang === Lang.NONE) lang = Lang.CJK;
			else if (lang !== Lang.CJK) return Lang.OTHER;
			i += cp > 0xffff ? 2 : 1;
			continue;
		}

		// Emoji
		if (
			(cp >= 0x1f300 && cp <= 0x1faff) ||
			(cp >= 0x2600 && cp <= 0x27bf)
		) {
			if (lang === Lang.NONE) lang = Lang.EMOJI;
			else if (lang !== Lang.EMOJI) return Lang.OTHER;
		}
		// 俄语 / 西里尔
		else if (cp >= 0x0400 && cp <= 0x04ff) {
			if (lang === Lang.NONE) lang = Lang.RU;
			else if (lang !== Lang.RU) return Lang.OTHER;
		}
		// 阿拉伯
		else if (cp >= 0x0600 && cp <= 0x06ff) {
			if (lang === Lang.NONE) lang = Lang.AR;
			else if (lang !== Lang.AR) return Lang.OTHER;
		}
		// 印地语（天城文）
		else if (cp >= 0x0900 && cp <= 0x097f) {
			if (lang === Lang.NONE) lang = Lang.HI;
			else if (lang !== Lang.HI) return Lang.OTHER;
		}
		// 泰语
		else if (cp >= 0x0e00 && cp <= 0x0e7f) {
			if (lang === Lang.NONE) lang = Lang.TH;
			else if (lang !== Lang.TH) return Lang.OTHER;
		}
		// 希伯来
		else if (cp >= 0x0590 && cp <= 0x05ff) {
			if (lang === Lang.NONE) lang = Lang.HE;
			else if (lang !== Lang.HE) return Lang.OTHER;
		}
		// 希腊
		else if (cp >= 0x0370 && cp <= 0x03ff) {
			if (lang === Lang.NONE) lang = Lang.EL;
			else if (lang !== Lang.EL) return Lang.OTHER;
		} else {
			return Lang.OTHER;
		}

		i += cp > 0xffff ? 2 : 1;
	}

	return lang === Lang.NONE ? Lang.EN : lang;
}
