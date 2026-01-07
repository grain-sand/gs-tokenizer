import {beforeEach, describe, expect, it} from "vitest";
import { getCachedTokenizer } from "./utils/tokenizer-factory";

describe('Multilingual Tokenizer - Social Media Tests', () => {
  let tokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  it('should correctly identify #hashtags', () => {
    const text = '这是一个#测试 #Hashtag #中文标签';
    console.log('Testing hashtags:', text);

    const tokens = tokenizer.tokenize(text);
    const hashtagTokens = tokens.filter(token => token.type === 'hashtag');

    console.log('Hashtag tokens:', hashtagTokens);

    expect(hashtagTokens.length).toBe(3);
    expect(hashtagTokens.map(t => t.txt)).toContain('#测试');
    expect(hashtagTokens.map(t => t.txt)).toContain('#Hashtag');
    expect(hashtagTokens.map(t => t.txt)).toContain('#中文标签');
  });

  it('should correctly identify @mentions', () => {
    const text = '你好 @user123，@admin 请查看这个问题';
    console.log('Testing mentions:', text);

    const tokens = tokenizer.tokenize(text);
    const mentionTokens = tokens.filter(token => token.type === 'mention');

    console.log('Mention tokens:', mentionTokens);

    expect(mentionTokens.length).toBe(2);
    expect(mentionTokens.map(t => t.txt)).toContain('@user123');
    expect(mentionTokens.map(t => t.txt)).toContain('@admin');
  });

  it('should handle mixed social media elements', () => {
    const text = '@Alice 你看过#技术分享 吗？@Bob 也在讨论这个';
    console.log('Testing mixed social elements:', text);

    const tokens = tokenizer.tokenize(text);
    const hashtagTokens = tokens.filter(token => token.type === 'hashtag');
    const mentionTokens = tokens.filter(token => token.type === 'mention');

    console.log('Mixed social tokens:', tokens);

    expect(hashtagTokens.length).toBe(1);
    expect(mentionTokens.length).toBe(2);
    expect(hashtagTokens[0].txt).toBe('#技术分享');
    expect(mentionTokens.map(t => t.txt)).toContain('@Alice');
    expect(mentionTokens.map(t => t.txt)).toContain('@Bob');
  });

  it('should not classify # as emoji', () => {
    const text = '#测试 #123 #abc';
    console.log('Testing # not as emoji:', text);

    const tokens = tokenizer.tokenize(text);
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    const hashtagTokens = tokens.filter(token => token.type === 'hashtag');

    console.log('Tokens with #:', tokens);

    // # 不应该被识别为表情
    expect(emojiTokens.length).toBe(0);
    // #开头的内容应该被识别为hashtag
    expect(hashtagTokens.length).toBe(3);
  });
});
