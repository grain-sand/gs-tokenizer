import {Lang} from '../../type';
import {detectLang} from './detectLang';

/**
 * Lang类型辅助工具类
 * 提供Lang类型的快速判断和操作方法
 */
export class LangHelper {


	static is(lang: Lang, n: number | Lang): boolean {
		return (lang & n) !== 0;
	}

	/**
	 * 判断是否为数字类型
	 * @param lang 语言类型
	 * @returns 是否为数字类型
	 */
	static isNumeric(lang: Lang): boolean {
		return (lang & Lang.NUMERIC) !== 0;
	}

	/**
	 * 判断是否为符号类型
	 * @param lang 语言类型
	 * @returns 是否为符号类型
	 */
	static isSymbol(lang: Lang): boolean {
		return (lang & Lang.SYMBOL) !== 0;
	}

	/**
	 * 判断是否为CJK（中、日、韩）
	 * @param lang 语言类型
	 * @returns 是否为CJK
	 */
	static isCJK(lang: Lang): boolean {
		return (lang & Lang.CJK) !== 0;
	}

}

/**
 * DetectLang辅助工具类
 * 提供对detectLang函数的快速使用方式，参数为字符串
 */
export class DetectLangHelper {
	/**
	 * 判断文本是否为数字类型
	 * @param str 输入文本
	 * @param fastCJK 是否快速检测CJK语言
	 * @returns 是否为数字类型
	 */
	static isNumeric(str: string, fastCJK = true): boolean {
		return LangHelper.isNumeric(detectLang(str, fastCJK));
	}

	/**
	 * 判断文本是否为符号类型
	 * @param str 输入文本
	 * @param fastCJK 是否快速检测CJK语言
	 * @returns 是否为符号类型
	 */
	static isSymbol(str: string, fastCJK = true): boolean {
		return LangHelper.isSymbol(detectLang(str, fastCJK));
	}

	/**
	 * 判断文本是否为CJK（中、日、韩）
	 * @param str 输入文本
	 * @param fastCJK 是否快速检测CJK语言
	 * @returns 是否为CJK
	 */
	static isCJK(str: string, fastCJK = true): boolean {
		return LangHelper.isCJK(detectLang(str, fastCJK));
	}

}

// 保留原有的工具函数导出，确保向后兼容性
const {isNumeric, isSymbol, isCJK} = DetectLangHelper;
export {isNumeric, isSymbol, isCJK};
