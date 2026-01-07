/**
 * 文本分词选项接口
 */
export interface ITokenizeTextOptions {
  /** 是否包含单词类型的token */
  includeWords?: boolean;
  /** 是否包含标点符号类型的token */
  includePunctuation?: boolean;
  /** 是否包含空格类型的token */
  includeSpaces?: boolean;
  /** 是否包含其他类型的token */
  includeOther?: boolean;
  /** 是否包含表情符号类型的token */
  includeEmojis?: boolean;
  /** 是否包含日期类型的token */
  includeDates?: boolean;
  /** 是否包含主机名类型的token */
  includeHosts?: boolean;
  /** 是否包含IP地址类型的token */
  includeIPs?: boolean;
  /** 是否包含数字类型的token */
  includeNumbers?: boolean;
  /** 是否包含话题标签类型的token */
  includeHashtags?: boolean;
  /** 是否包含提及类型的token */
  includeMentions?: boolean;
  /** 包含的类型数组 */
  includeTypes?: string[];
}
