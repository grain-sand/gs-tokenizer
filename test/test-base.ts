import {beforeEach, describe, expect, it} from "vitest";
import { MultilingualTokenizer } from "../src";

// // const console = (top as any).console;

describe('Multilingual Tokenizer - Base Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  // Removed createTokenizer factory function test

  it('should return only words when using tokenizeText', () => {
    const text = 'Hello world! 我爱北京天安门。';
    console.log('Testing tokenizeText method:', text);
    
    const words = tokenizer.tokenizeText(text);
    
    console.log('tokenizeText result:', words);
    
    expect(words.every(word => 
      !word.match(/^\s+$/) && 
      !word.match(/^[^\p{L}\p{N}]+$/u)
    )).toBe(true);
  });

  it('should automatically detect language', () => {
    const texts = [
      { text: 'Hello world', expectedLang: 'en' },
      { text: '你好世界', expectedLang: 'zh' },
      { text: 'こんにちは世界', expectedLang: 'ja' },
      { text: '안녕하세요 세계', expectedLang: 'ko' }
    ];
    
    console.log('Testing language detection');
    
    texts.forEach(({ text, expectedLang }) => {
      const tokens = tokenizer.tokenize(text);
      const detectedLang = tokens[0]?.lang;
      console.log(`Text: ${text}, Detected language: ${detectedLang}, Expected: ${expectedLang}`);
      expect(detectedLang).toBe(expectedLang);
    });
  });
});
