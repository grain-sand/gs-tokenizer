import {beforeEach, describe, expect, it} from 'vitest';
import { MultilingualTokenizer } from '../src/core';

// const console = (top as any).console;

describe('Multilingual Tokenizer - Date Tests', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer();
  });

  describe('Chinese Date Tests', () => {
    it('should recognize Chinese date format: 2023年10月1日', () => {
      const text = '今天是2023年10月1日，天气很好。';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Chinese date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '2023年10月1日')).toBe(true);
    });

    it('should recognize Chinese date format with separator: 2023-10-01', () => {
      const text = '会议日期定在2023-10-01，地点是北京。';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Chinese date with dash tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '2023-10-01')).toBe(true);
    });

    it('should recognize Chinese date format with slash: 2023/10/01', () => {
      const text = '我的生日是2023/10/01。';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Chinese date with slash tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '2023/10/01')).toBe(true);
    });

    it('should recognize Chinese date format with dot: 2023.10.01', () => {
      const text = '项目截止日期是2023.10.01。';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Chinese date with dot tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '2023.10.01')).toBe(true);
    });
  });

  describe('English Date Tests', () => {
    it('should recognize English date format: October 1, 2023', () => {
      const text = 'The meeting is scheduled for October 1, 2023.';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('English full month date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt.includes('October'))).toBe(true);
    });

    it('should recognize English date format: 10/01/2023', () => {
      const text = 'Please submit your report by 10/01/2023.';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('English date with slash tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '10/01/2023')).toBe(true);
    });

    it('should recognize English date format: 2023-10-01', () => {
      const text = 'The event will take place on 2023-10-01.';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('English ISO date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '2023-10-01')).toBe(true);
    });

    it('should recognize English short month date format: Oct 1, 2023', () => {
      const text = 'The deadline is Oct 1, 2023.';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('English short month date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt.includes('Oct'))).toBe(true);
    });
  });

  describe('Common Date Tests', () => {
    it('should recognize 8-digit date format: 20231001', () => {
      const text = '订单日期是20231001';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('8-digit date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '20231001')).toBe(true);
    });

    it('should recognize 8-digit date format in standalone text', () => {
      const text = '20231001';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Standalone 8-digit date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(0);
      expect(dateTokens.some(token => token.txt === '20231001')).toBe(true);
    });

    it('should not recognize invalid dates', () => {
      const text = '无效日期:2023-13-32';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date' && token.txt === '2023-13-32');
      
      console.log('Invalid date tokens:', dateTokens);
      expect(dateTokens.length).toBe(0);
    });

    it('should handle multiple dates in one text', () => {
      const text = '会议时间:2023年10月1日至2023年10月5日，英文日期:October 1, 2023。';
      const tokens = tokenizer.tokenize(text);
      const dateTokens = tokens.filter(token => token.type === 'date');
      
      console.log('Multiple date tokens:', dateTokens);
      expect(dateTokens.length).toBeGreaterThan(1);
    });
  });
});