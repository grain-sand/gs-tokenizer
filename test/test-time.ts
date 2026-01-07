import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedTokenizer } from './utils/tokenizer-factory';

describe('Multilingual Tokenizer - Time Recognition', () => {
  let tokenizer;

  beforeEach(() => {
    tokenizer = getCachedTokenizer();
  });

  describe('Chinese Time Tests', () => {
    it('should recognize Chinese time format: 5小时', () => {
      const text = '我需要5小时完成这个任务。';
      const tokens = tokenizer.tokenize(text);

      console.log('Chinese time token: 5小时', tokens);
      const timeToken = tokens.find(token => token.txt === '5小时' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });

    it('should recognize Chinese time format: 30分钟', () => {
      const text = '这个会议大约需要30分钟。';
      const tokens = tokenizer.tokenize(text);

      console.log('Chinese time token: 30分钟', tokens);
      const timeToken = tokens.find(token => token.txt === '30分钟' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });

    it('should recognize Chinese time format: 120秒', () => {
      const text = '请在120秒内完成这个挑战。';
      const tokens = tokenizer.tokenize(text);

      console.log('Chinese time token: 120秒', tokens);
      const timeToken = tokens.find(token => token.txt === '120秒' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });

    it('should recognize Chinese time format: 3天', () => {
      const text = '我需要3天时间来准备。';
      const tokens = tokenizer.tokenize(text);

      console.log('Chinese time token: 3天', tokens);
      const timeToken = tokens.find(token => token.txt === '3天' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });
  });

  describe('English Time Tests', () => {
    it('should recognize English time format: 5 hours', () => {
      const text = 'I need 5 hours to finish this task.';
      const tokens = tokenizer.tokenize(text);

      console.log('English time token: 5 hours', tokens);
      const timeToken = tokens.find(token => token.txt === '5 hours' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });

    it('should recognize English time format: 30 minutes', () => {
      const text = 'This meeting will take about 30 minutes.';
      const tokens = tokenizer.tokenize(text);

      console.log('English time token: 30 minutes', tokens);
      const timeToken = tokens.find(token => token.txt === '30 minutes' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });

    it('should recognize English time format: 2 seconds', () => {
      const text = 'Please finish this challenge in 2 seconds.';
      const tokens = tokenizer.tokenize(text);

      console.log('English time token: 2 seconds', tokens);
      const timeToken = tokens.find(token => token.txt === '2 seconds' && token.type === 'date');
      expect(timeToken).toBeDefined();
    });
  });

  describe('Mixed Date and Time Tests', () => {
    it('should recognize both date and time formats in one text', () => {
      const text = '我需要在2023年10月1日之前的3天内完成这个任务，每天至少工作8小时。';
      const tokens = tokenizer.tokenize(text);

      console.log('Mixed date and time tokens', tokens);
      const dateToken = tokens.find(token => token.txt.includes('2023年10月1日') && token.type === 'date');
      const daysToken = tokens.find(token => token.txt === '3天' && token.type === 'date');
      const hoursToken = tokens.find(token => token.txt === '8小时' && token.type === 'date');

      expect(dateToken).toBeDefined();
      expect(daysToken).toBeDefined();
      expect(hoursToken).toBeDefined();
    });
  });
});
