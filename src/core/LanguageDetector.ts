/**
 * 语言检测类，用于检测文本的语言类型
 * @class LanguageDetector
 */
export class LanguageDetector {
  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 检测到的语言代码：'ja'（日语）、'ko'（韩语）、'zh'（中文）或默认的'en'（英文）
   */
  static detectLanguage(text: string): string {
    // 检查是否包含日文平假名或片假名
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      return 'ja';
    }
    // 检查是否包含韩文
    if (/[\uac00-\ud7af]/.test(text)) {
      return 'ko';
    }
    // 检查是否包含中文
    if (/[\u4e00-\u9fff]/.test(text)) {
      return 'zh';
    }
    // 默认为英文
    return 'en';
  }
}