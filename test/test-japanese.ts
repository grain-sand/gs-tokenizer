import {beforeEach, describe, expect, it} from "vitest";
import { IMultilingualTokenizer } from "../src";
import { getCachedTokenizer } from "./utils/tokenizer-factory";

// // const console = (top as any).console;

describe('Multilingual Tokenizer - Japanese Tests', () => {
  let tokenizer: IMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  it('should tokenize Japanese text by natural words', () => {
    const text = 'こんにちは世界！私は日本人です。';
    console.log('Testing Japanese tokenization:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Japanese tokenization result:', wordTokens);
    console.log('Full tokens:', tokens);
    
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'ja')).toBe(true);
  });

  it('should handle Japanese with Kanji and Hiragana', () => {
    const text = '日本語の文章をトークン化する';
    console.log('Testing Japanese mixed characters:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Japanese mixed characters result:', wordTokens);
    
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'ja')).toBe(true);
  });
});
