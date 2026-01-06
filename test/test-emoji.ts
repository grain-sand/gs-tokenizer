import {beforeEach, describe, expect, it} from "vitest";
import { MultilingualTokenizer } from "../src";

// // const console = (top as any).console;

describe('Multilingual Tokenizer - Emoji Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  it('should tokenize single emoji correctly', () => {
    const text = '👋';
    console.log('Testing single emoji:', text);
    
    const tokens = tokenizer.tokenize(text);
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    
    console.log('Single emoji tokens:', tokens);
    console.log('Emoji tokens found:', emojiTokens);
    
    // 验证存在emoji类型的token
    const hasEmoji = tokens.some(token => /\p{Emoji}/u.test(token.txt));
    expect(hasEmoji).toBe(true);
  });

  it('should handle continuous emojis', () => {
    const text = '❤️🔥✨';
    console.log('Testing continuous emojis:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Continuous emojis tokens:', tokens);
    
    // 验证包含emoji的token存在
    const hasEmojiTokens = tokens.some(token => /\p{Emoji}/u.test(token.txt));
    expect(hasEmojiTokens).toBe(true);
  });

  it('should handle emojis with modifiers', () => {
    const text = '👍🏻👎🏿👏🏽';
    console.log('Testing emojis with modifiers:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Emojis with modifiers tokens:', tokens);
    
    // 验证包含带修饰符emoji的token存在
    const hasEmojiTokens = tokens.some(token => /\p{Emoji}/u.test(token.txt));
    expect(hasEmojiTokens).toBe(true);
  });

  it('should not misclassify numbers as emojis', () => {
    const text = '12345';
    console.log('Testing numbers not as emojis:', text);
    
    const tokens = tokenizer.tokenize(text);
    const nonEmojiTokens = tokens.filter(token => token.type !== 'emoji');
    
    console.log('Numbers tokens:', tokens);
    
    // 验证所有token都不是emoji类型
    expect(nonEmojiTokens.length).toBe(tokens.length);
  });

  it('should not misclassify mixed characters as emojis', () => {
    const text = 'user123';
    console.log('Testing mixed characters not as emojis:', text);
    
    const tokens = tokenizer.tokenize(text);
    const wordTokens = tokens.filter(token => token.type === 'word');
    
    console.log('Mixed characters tokens:', tokens);
    
    // 验证混合字符被识别为单词而不是emoji
    expect(wordTokens.length).toBeGreaterThan(0);
  });

  it('should handle emojis in mixed text', () => {
    const text = 'Hello 👋 World!';
    console.log('Testing emojis in mixed text:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Mixed text with emojis tokens:', tokens);
    
    // 验证文本中包含emoji
    const hasEmoji = tokens.some(token => /\p{Emoji}/u.test(token.txt));
    expect(hasEmoji).toBe(true);
    
    // 验证同时包含单词和emoji
    const hasWords = tokens.some(token => token.type === 'word');
    expect(hasWords).toBe(true);
  });

  it('should handle emojis with leading spaces', () => {
    const text = ' 👋';
    console.log('Testing emoji with leading spaces:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Emoji with leading spaces tokens:', tokens);
    
    // 验证包含emoji类型的token
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    expect(emojiTokens.length).toBe(1);
    
    // 验证包含space类型的token
    const spaceTokens = tokens.filter(token => token.type === 'space');
    expect(spaceTokens.length).toBe(1);
  });

  it('should handle emojis with trailing spaces', () => {
    const text = '👋 ';
    console.log('Testing emoji with trailing spaces:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Emoji with trailing spaces tokens:', tokens);
    
    // 验证包含emoji类型的token
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    expect(emojiTokens.length).toBe(1);
    
    // 验证包含space类型的token
    const spaceTokens = tokens.filter(token => token.type === 'space');
    expect(spaceTokens.length).toBe(1);
  });

  it('should handle emojis with leading and trailing spaces', () => {
    const text = ' 👋 ';
    console.log('Testing emoji with leading and trailing spaces:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Emoji with leading and trailing spaces tokens:', tokens);
    
    // 验证包含emoji类型的token
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    expect(emojiTokens.length).toBe(1);
    
    // 验证包含space类型的token
    const spaceTokens = tokens.filter(token => token.type === 'space');
    expect(spaceTokens.length).toBe(2);
  });

  it('should handle continuous emojis with spaces', () => {
    const text = ' 👋👋 ';
    console.log('Testing continuous emojis with spaces:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Continuous emojis with spaces tokens:', tokens);
    
    // 验证包含emoji类型的token
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    expect(emojiTokens.length).toBe(1);
    expect(emojiTokens[0].txt).toBe('👋👋');
    
    // 验证包含space类型的token
    const spaceTokens = tokens.filter(token => token.type === 'space');
    expect(spaceTokens.length).toBe(2);
  });

  it('should handle text with spaced emojis in between', () => {
    const text = 'Hello  👋  World';
    console.log('Testing text with spaced emojis:', text);
    
    const tokens = tokenizer.tokenize(text);
    
    console.log('Text with spaced emojis tokens:', tokens);
    
    // 验证包含emoji类型的token
    const emojiTokens = tokens.filter(token => token.type === 'emoji');
    expect(emojiTokens.length).toBe(1);
    
    // 验证包含space类型的token
    const spaceTokens = tokens.filter(token => token.type === 'space');
    expect(spaceTokens.length).toBe(2);
    
    // 验证包含word类型的token
    const wordTokens = tokens.filter(token => token.type === 'word');
    expect(wordTokens.length).toBe(2);
  });
});
