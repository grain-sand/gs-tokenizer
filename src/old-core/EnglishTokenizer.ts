import { IToken, ILexiconEntry } from '../old-type';
import { ILanguageTokenizer } from './ILanguageTokenizer';

/**
 * 英文分词器类，实现ILanguageTokenizer接口，用于处理英文文本的分词
 * @class EnglishTokenizer
 * @implements {ILanguageTokenizer}
 */
export class EnglishTokenizer implements ILanguageTokenizer {
  /** 自定义词库，键为语言代码，值为该语言的词库条目数组 */
  private dictionaries: Record<string, ILexiconEntry[]>;

  /**
   * 构造函数
   * @param dictionaries - 自定义词库，默认为空对象
   */
  constructor(dictionaries: Record<string, ILexiconEntry[]> = {}) {
    this.dictionaries = dictionaries;
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
  tokenize(text: string, language: string): IToken[] {
    const tokens: IToken[] = [];
    const chars = Array.from(text); // 正确处理Unicode代理对
    let currentIndex = 0;
    const length = chars.length;

    while (currentIndex < length) {
      const char = chars[currentIndex];

      // 处理空格
      if (char.match(/\s/)) {
        let spaceEnd = currentIndex;
        while (spaceEnd < length && chars[spaceEnd].match(/\s/)) {
          spaceEnd++;
        }
        const tokenText = chars.slice(currentIndex, spaceEnd).join('');
        tokens.push({
          txt: tokenText,
          type: 'space',
          lang: language,
          src: ''
        });
        currentIndex = spaceEnd;
        continue;
      }

      // 处理emoji
      if (this.isEmoji(char)) {
        let emojiEnd = currentIndex;
        while (emojiEnd < length && this.isEmoji(chars[emojiEnd])) {
          emojiEnd++;
        }
        const tokenText = chars.slice(currentIndex, emojiEnd).join('');
        tokens.push({
          txt: tokenText,
          type: 'emoji',
          lang: language,
          src: ''
        });
        currentIndex = emojiEnd;
        continue;
      }

      // 处理单词（字母数字组合）
      if (char.match(/[a-zA-Z0-9]/)) {
        let wordEnd = currentIndex;
        while (wordEnd < length && chars[wordEnd].match(/[a-zA-Z0-9]/)) {
          wordEnd++;
        }
        const tokenText = chars.slice(currentIndex, wordEnd).join('');
        tokens.push({
          txt: tokenText,
          type: 'word',
          lang: language,
          src: ''
        });
        currentIndex = wordEnd;
        continue;
      }

      // 处理标点符号
      let punctuationEnd = currentIndex;
      while (punctuationEnd < length) {
        const c = chars[punctuationEnd];
        if (!(/[^a-zA-Z0-9\s]/.test(c) && !this.isEmoji(c))) {
          break;
        }
        punctuationEnd++;
      }
      const tokenText = chars.slice(currentIndex, punctuationEnd).join('');
      tokens.push({
        txt: tokenText,
        type: 'punctuation',
        lang: language,
        src: ''
      });
      currentIndex = punctuationEnd;
    }

    // 标记英文姓名
    return this.tagNameTokens(tokens, language);
  }

  /**
   * 判断字符是否为emoji
   * @param char - 要判断的字符
   * @returns 如果是emoji返回true，否则返回false
   */
  private isEmoji(char: string): boolean {
    return /\p{Emoji}/u.test(char) && !/[0-9#]/.test(char);
  }



  private tagNameTokens(tokens: IToken[], language: string): IToken[] {
    const taggedTokens: IToken[] = [];
    let i = 0;

    while (i < tokens.length) {
      // 检查自定义词库
      if (i < tokens.length && tokens[i].type === 'word') {
        const word = tokens[i].txt;
        if (this.dictionaries[language]) {
          let matched = false;
          for (const lexicon of this.dictionaries[language].sort((a, b) => b.priority - a.priority)) {
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
