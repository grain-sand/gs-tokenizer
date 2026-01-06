import {beforeEach, describe, expect, it} from "vitest";
import { IMultilingualTokenizer } from "../src";
import { getCachedTokenizer } from "./utils/tokenizer-factory";

describe('Multilingual Tokenizer - Mixed Language Tests', () => {
  let tokenizer: IMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  it('should handle mixed language text', () => {
    const text = '我爱JavaScript编程，这是一门很棒的language。';
    console.log('Testing mixed language tokenization:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Mixed language tokenization result:', wordTokens);
    console.log('Full tokens:', tokens);
    
    // 验证包含基本词汇（不严格要求分词粒度）
    expect(wordTokens.some(token => token.includes('我'))).toBe(true);
    expect(wordTokens.some(token => token.includes('爱'))).toBe(true);
    expect(wordTokens).toContain('JavaScript');
    expect(wordTokens.some(token => token.includes('编'))).toBe(true);
    expect(wordTokens.some(token => token.includes('程'))).toBe(true);
    expect(wordTokens.some(token => token.includes('这'))).toBe(true);
    expect(wordTokens.some(token => token.includes('是'))).toBe(true);
    expect(wordTokens.some(token => token.includes('棒'))).toBe(true);
    expect(wordTokens).toContain('language');
  });

  it('should handle complex mixed language sentences', () => {
    const text = '我正在学习Python和Java，这些是popular的programming languages。';
    console.log('Testing complex mixed language:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Complex mixed language result:', wordTokens);
    
    expect(wordTokens).toContain('Python');
    expect(wordTokens).toContain('Java');
    expect(wordTokens).toContain('popular');
    expect(wordTokens).toContain('programming');
    expect(wordTokens).toContain('languages');
    expect(wordTokens.some(token => token.includes('我'))).toBe(true);
    expect(wordTokens.some(token => token.includes('学习'))).toBe(true);
  });

  it('should handle multi-language mixed with CJK and English', () => {
    const text = '日本の東京でiPhoneを買いました，非常にexpensiveです。';
    console.log('Testing multi-language mixed:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Multi-language mixed tokenization result:', wordTokens);
    
    expect(wordTokens).toContain('iPhone');
    expect(wordTokens).toContain('expensive');
    expect(wordTokens.some(token => token.includes('日本'))).toBe(true);
    expect(wordTokens.some(token => token.includes('東京'))).toBe(true);
    expect(wordTokens.some(token => token.includes('買い'))).toBe(true);
  });

  it('should handle language detection for mixed text segments', () => {
    // LanguageDetector根据整个文本的主要字符类型返回一种语言
    // 所以分别测试每种语言的文本段
    const testTexts = [
      { text: 'Hello', expectedLang: 'en' },
      { text: '你好', expectedLang: 'zh' },
      { text: 'こんにちは', expectedLang: 'ja' },
      { text: '안녕하세요', expectedLang: 'ko' }
    ];
    
    console.log('Testing language detection for different text segments');
    
    testTexts.forEach(({ text, expectedLang }) => {
      const tokens = tokenizer.tokenize(text);
      const detectedLang = tokens[0]?.lang;
      console.log(`Text: ${text}, Detected language: ${detectedLang}, Expected: ${expectedLang}`);
      expect(detectedLang).toBe(expectedLang);
    });
  });

  it('should handle number-letter combinations as whole tokens', () => {
    const text = '5G技术正在改变世界，4K视频更清晰。';
    console.log('Testing number-letter combinations:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Number-letter combinations tokenization result:', wordTokens);
    
    // "5G"和"4K"应该作为整体分词
    expect(wordTokens).toContain('5G');
    expect(wordTokens).toContain('4K');
  });

  // Emoji related tests have been moved to test-emoji.ts
});
