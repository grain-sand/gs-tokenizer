import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// 词库目录
const EN_LEXICON_DIR = join(__dirname, '..', 'src', 'lexicon', 'en');

// 清除不包含空格的词的正则表达式
const NO_SPACE_REGEX = /^\S+$/;

/**
 * 读取词库文件内容
 * @param filePath 文件路径
 * @returns { variableName: string, words: string[] }
 */
function readLexiconFile(filePath: string): { variableName: string; words: string[] } {
  const content = readFileSync(filePath, 'utf-8');

  // 提取变量名
  const exportMatch = content.match(/export\s+const\s+(\w+)/);
  if (!exportMatch) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到导出的变量名`);
  }
  const variableName = exportMatch[1];

  // 提取模板字符串内容
  const templateMatch = content.match(/`([\s\S]*?)`/);
  if (!templateMatch) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到模板字符串`);
  }
  const templateContent = templateMatch[1];

  // 拆分词汇
  const words = templateContent
    .split('\u001F')
    .map(word => word.trim())
    .filter(word => word.length > 0);

  return { variableName, words };
}

/**
 * 写入词库文件
 * @param filePath 文件路径
 * @param variableName 变量名
 * @param words 词汇数组
 */
function writeLexiconFile(filePath: string, variableName: string, words: string[]): void {
  const templateContent = words.join('\u001F');
  const fileContent = `const value = \`${templateContent}\`;

export const ${variableName}: string = value;`;

  writeFileSync(filePath, fileContent, 'utf-8');
}

/**
 * 处理单个词库文件
 * @param filePath 文件路径
 * @returns 处理结果统计
 */
function processLexiconFile(filePath: string): { originalCount: number; cleanedCount: number; removedCount: number } {
  console.log(`正在处理文件: ${filePath}`);

  const { variableName, words } = readLexiconFile(filePath);
  const originalCount = words.length;

  // 过滤掉不包含空格的词（只保留包含空格的词）
  const cleanedWords = words.filter(word => !NO_SPACE_REGEX.test(word));
  const cleanedCount = cleanedWords.length;
  const removedCount = originalCount - cleanedCount;

  // 写入回文件
  writeLexiconFile(filePath, variableName, cleanedWords);

  console.log(`  原始词汇数: ${originalCount}`);
  console.log(`  清理后词汇数: ${cleanedCount}`);
  console.log(`  移除词汇数: ${removedCount}`);

  return { originalCount, cleanedCount, removedCount };
}

/**
 * 主函数
 */
function main() {
  console.log('开始清理英文词库中不包含空格的词...\n');

  // 获取所有英文词库文件
  const files = readdirSync(EN_LEXICON_DIR)
    .filter(file => extname(file) === '.ts')
    .map(file => join(EN_LEXICON_DIR, file));

  let totalOriginalCount = 0;
  let totalCleanedCount = 0;
  let totalRemovedCount = 0;

  // 处理每个文件
  files.forEach(file => {
    try {
      const stats = processLexiconFile(file);
      totalOriginalCount += stats.originalCount;
      totalCleanedCount += stats.cleanedCount;
      totalRemovedCount += stats.removedCount;
      console.log();
    } catch (error) {
      console.error(`处理文件 ${file} 失败:`, error);
      console.log();
    }
  });

  // 输出总体统计
  console.log('=== 清理完成 ===');
  console.log(`总文件数: ${files.length}`);
  console.log(`总原始词汇数: ${totalOriginalCount}`);
  console.log(`总清理后词汇数: ${totalCleanedCount}`);
  console.log(`总移除词汇数: ${totalRemovedCount}`);
}

// 执行主函数
main();
