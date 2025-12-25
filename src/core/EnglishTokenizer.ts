import { Token, LexiconEntry } from './types';
import { LanguageTokenizer } from './LanguageTokenizer';

/**
 * 英文分词器类，实现LanguageTokenizer接口，用于处理英文文本的分词
 * @class EnglishTokenizer
 * @implements {LanguageTokenizer}
 */
export class EnglishTokenizer implements LanguageTokenizer {
  /** 自定义词库，键为语言代码，值为该语言的词库条目数组 */
  private customDictionaries: Record<string, LexiconEntry[]>;

  /**
   * 构造函数
   * @param customDictionaries - 自定义词库，默认为空对象
   */
  constructor(customDictionaries: Record<string, LexiconEntry[]> = {}) {
    this.customDictionaries = customDictionaries;
  }

  /**
   * 检测文本的语言是否为英文
   * @param text - 要检测语言的文本
   * @returns 如果是英文返回'en'，否则返回空字符串
   */
  detectLanguage(text: string): string {
    // 如果文本完全是英文（包含数字+字母组合）且不包含中文字符，返回'en'
    if (/^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]+$/.test(text) && !/[一-鿿]/.test(text)) {
      return 'en';
    }
    return '';
  }

  /**
   * 对英文文本进行分词
   * @param text - 要分词的英文文本
   * @param language - 指定的语言代码（通常为'en'）
   * @returns 分词结果的Token数组
   */
  tokenize(text: string, language: string): Token[] {
    const tokens: Token[] = [];
    const words = text.split(/\b/);
    
    for (const word of words) {
      if (!word) continue;
      
      if (word.match(/^\s+$/)) {
        tokens.push({ txt: word, type: 'space', lang: language, src: '' });
      } else if (/^\p{Emoji}+$/u.test(word) && !/[0-9#]/.test(word)) {
        tokens.push({ txt: word, type: 'emoji', lang: language, src: '' });
      } else if (word.match(/^[^a-zA-Z0-9]+$/)) {
        tokens.push({ txt: word, type: 'punctuation', lang: language, src: '' });
      } else if (word.match(/^[a-zA-Z0-9]+$/)) {
        tokens.push({ txt: word, type: 'word', lang: language, src: '' });
      } else {
        tokens.push({ txt: word, type: 'other', lang: language, src: '' });
      }
    }
    
    // 标记英文姓名
    return this.tagNameTokens(tokens, language);
  }

  private tagNameTokens(tokens: Token[], language: string): Token[] {
    const taggedTokens: Token[] = [];
    let i = 0;

    while (i < tokens.length) {
      // 检查自定义词库
      if (i < tokens.length && tokens[i].type === 'word') {
        const word = tokens[i].txt;
        if (this.customDictionaries[language]) {
          let matched = false;
          for (const lexicon of this.customDictionaries[language].sort((a, b) => b.priority - a.priority)) {
            if (lexicon.data.has(word)) {
              taggedTokens.push({
                txt: word,
                type: 'word',
                lang: language,
                src: lexicon.name
              });
              i++;
              matched = true;
              break;
            }
          }
          if (matched) continue;
        }
      }
      
      // 如果没有匹配到任何词库，保留原始token
      taggedTokens.push({
        txt: tokens[i].txt,
        type: tokens[i].type,
        lang: language,
        src: tokens[i].src || ''
      });
      i++;
    }

    return taggedTokens;
  }
}
