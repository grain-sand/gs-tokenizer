import {beforeEach, describe, expect, it} from "vitest";
import { IMultilingualTokenizer } from "../src";
import { getCachedTokenizer } from "./utils/tokenizer-factory";

// // const console = (top as any).console;

describe('Multilingual Tokenizer - Korean Tests', () => {
  let tokenizer: IMultilingualTokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  it('should tokenize Korean text by natural words', () => {
    const text = '안녕하세�?세계! 저�?한국인입니다.';
    console.log('Testing Korean tokenization:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Korean tokenization result:', wordTokens);
    console.log('Full tokens:', tokens);
    
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'ko')).toBe(true);
  });

  it('should handle Korean sentences correctly', () => {
    const text = '한국어는 아름다운 언어입니�?';
    console.log('Testing Korean sentence:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Korean sentence result:', wordTokens);
    
    expect(wordTokens.length).toBeGreaterThan(0);
    expect(tokens.some(token => token.lang === 'ko')).toBe(true);
  });
});
