/**
 * 基于词库的多语言分词器实现
 * @class NextMultilingualTokenizer
 * @implements {IMultilingualTokenizer}
 */
import { IMultilingualTokenizer, INextToken } from '../type';

interface LexiconEntry {
  word: string;
  length: number;
  language?: string;
  source: string;
}

export class NextMultilingualTokenizer implements IMultilingualTokenizer {
  private lexicons: Map<string, LexiconEntry[]> = new Map();
  private lexiconNames: Set<string> = new Set();
  private maxWordLength = 0;

  /**
   * 添加自定义词库
   * @param words - 要添加的单词数组
   * @param name - 词库名称
   * @param priority - 词库优先级（暂不使用）
   * @param language - 词库语言代码（可选）
   */
  addDictionary(words: string[], name: string, priority?: number, language?: string): void {
    // 按词长倒序排序，用于最长匹配
    const sortedWords = words
      .filter(word => word.trim().length > 0)
      .map(word => ({
        word,
        length: word.length,
        language,
        source: name
      }))
      .sort((a, b) => b.length - a.length);

    // 更新最大词长
    if (sortedWords.length > 0) {
      const currentMax = sortedWords[0].length;
      if (currentMax > this.maxWordLength) {
        this.maxWordLength = currentMax;
      }
    }

    // 添加到词库
    this.lexicons.set(name, sortedWords);
    this.lexiconNames.add(name);
  }

  /**
   * 移除自定义词库中的指定单词
   * @param word - 要移除的单词
   * @param language - 可选，指定要操作的语言词库
   * @param lexiconName - 可选，指定要操作的词库名称
   */
  removeCustomWord(word: string, language?: string, lexiconName?: string): void {
    if (lexiconName) {
      // 移除指定词库中的单词
      const lexicon = this.lexicons.get(lexiconName);
      if (lexicon) {
        const filtered = lexicon.filter(entry => entry.word !== word);
        if (filtered.length === 0) {
          this.lexicons.delete(lexiconName);
          this.lexiconNames.delete(lexiconName);
        } else {
          this.lexicons.set(lexiconName, filtered);
          // 重新计算最大词长
          this.updateMaxWordLength();
        }
      }
    } else {
      // 移除所有词库中的单词
      for (const [name, lexicon] of this.lexicons.entries()) {
        const filtered = lexicon.filter(entry => entry.word !== word);
        if (filtered.length === 0) {
          this.lexicons.delete(name);
          this.lexiconNames.delete(name);
        } else {
          this.lexicons.set(name, filtered);
        }
      }
      // 重新计算最大词长
      this.updateMaxWordLength();
    }
  }

  /**
   * 对文本进行分词
   * @param text - 要分词的文本
   * @param language - 可选，指定文本语言代码（暂不使用）
   * @returns 分词结果的Token数组
   */
  tokenize(text: string, language?: string): INextToken[] {
    const tokens: INextToken[] = [];
    let currentIndex = 0;
    const textLength = text.length;

    while (currentIndex < textLength) {
      let found = false;
      let matchedEntry: LexiconEntry | null = null;
      let matchedLength = 0;

      // 尝试从最大词长开始匹配
      const maxMatchLength = Math.min(this.maxWordLength, textLength - currentIndex);

      for (let length = maxMatchLength; length >= 1; length--) {
        const substring = text.substr(currentIndex, length);

        // 检查所有词库
        for (const [, lexicon] of this.lexicons.entries()) {
          const entry = lexicon.find(e => e.word === substring);
          if (entry) {
            matchedEntry = entry;
            matchedLength = length;
            found = true;
            break;
          }
        }

        if (found) break;
      }

      if (found && matchedEntry) {
        // 添加匹配的词
        tokens.push({
          txt: matchedEntry.word,
          type: 'word',
          lang: matchedEntry.language,
          src: matchedEntry.source,
          start: currentIndex,
          end: currentIndex + matchedLength
        });
        currentIndex += matchedLength;
      } else {
        // 添加单个字符作为other类型
        const char = text.charAt(currentIndex);
        tokens.push({
          txt: char,
          type: 'other',
          start: currentIndex,
          end: currentIndex + 1
        });
        currentIndex++;
      }
    }

    return tokens;
  }

  /**
   * 获取纯文本分词结果
   * @param text - 要分词的文本
   * @param options - 可选，配置项
   * @returns 文本数组
   */
  tokenizeText(text: string, options?: any): string[] {
    const tokens = this.tokenize(text);
    if (options?.includeTypes) {
      return tokens
        .filter(token => options.includeTypes?.includes(token.type))
        .map(token => token.txt);
    } else if (options?.excludeTypes) {
      return tokens
        .filter(token => !options.excludeTypes?.includes(token.type))
        .map(token => token.txt);
    }
    return tokens.map(token => token.txt);
  }

  /**
   * 获取当前已加载的所有词库名称
   */
  get loadedLexiconNames(): string[] {
    return Array.from(this.lexiconNames);
  }

  /**
   * 更新最大词长
   */
  private updateMaxWordLength(): void {
    let maxLength = 0;
    for (const [, lexicon] of this.lexicons.entries()) {
      if (lexicon.length > 0) {
        const lexiconMax = lexicon[0].length;
        if (lexiconMax > maxLength) {
          maxLength = lexiconMax;
        }
      }
    }
    this.maxWordLength = maxLength;
  }
}
