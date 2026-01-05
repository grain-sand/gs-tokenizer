import {describe, expect, it} from 'vitest';
import {QuickUseTokenizer} from '../src';

describe('Douyin Tokenization Test', () => {

  it('should tokenize "抖音" as a single word', () => {
    const text = '我喜欢刷抖音';
    console.log('Testing "抖音" tokenization:', text);
    
    const tokens = QuickUseTokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word').map(token => token.txt);
    
    console.log('Word tokens:', wordTokens);
    console.log('Full tokens:', tokens);
    
    // 检查"抖音"是否作为单个词被识别
    expect(wordTokens).toContain('抖音');
  });


});
