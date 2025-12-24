import { readFileSync, writeFileSync, statSync, readdirSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEXICON_DIR = join(__dirname, "..", "src", "lexicon");

interface FileStats {
  filePath: string;
  originalCount: number;
  optimizedCount: number;
  removedCount: number;
}

interface TotalStats {
  totalFiles: number;
  totalOriginalLines: number;
  totalOptimizedLines: number;
  totalRemovedLines: number;
}

const totalStats: TotalStats = {
  totalFiles: 0,
  totalOriginalLines: 0,
  totalOptimizedLines: 0,
  totalRemovedLines: 0
};

// 读取文件中的词
function readFileWords(filePath: string): { variableName: string; words: string[] } {
  const content = readFileSync(filePath, "utf-8");
  
  // 简单的字符串处理方法
  const exportStart = content.indexOf("export const ");
  if (exportStart === -1) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到 export const 语句`);
  }
  
  // 提取变量名，移除可能存在的类型声明
  const equalsPos = content.indexOf("=", exportStart);
  if (equalsPos === -1) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到 = 符号`);
  }
  
  const variableName = content.substring(exportStart + 13, equalsPos).trim().split(":")[0].trim();
  
  // 处理两种格式：
  // 1. export const variable = `...`;
  // 2. const value = `...`;
  //    export const variable: string = value;
  // 3. 带有重复类型声明的错误格式
  let templateStart = content.indexOf("`");
  if (templateStart === -1) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到开始的 \` 符号`);
  }
  
  const templateEnd = content.lastIndexOf("`");
  if (templateEnd === -1 || templateEnd <= templateStart) {
    throw new Error(`文件 ${filePath} 格式不正确，找不到结束的 \` 符号`);
  }
  
  const templateContent = content.substring(templateStart + 1, templateEnd);
  const words = templateContent
    .split("\u001F")
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return { variableName, words };
}

// 写回优化后的内容
function writeOptimizedFile(filePath: string, variableName: string, uniqueWords: string[]): void {
  const newTemplateContent = uniqueWords.join("\u001F");
  const newContent = `const value = \`${newTemplateContent}\`;\n\nexport const ${variableName}: string = value;`;
  writeFileSync(filePath, newContent, "utf-8");
}

// 优化单个文件（去重处理）
function optimizeSingleFile(filePath: string, processedWords: Set<string>, isOtherNames = false): FileStats {
  console.log(`正在优化文件: ${filePath}`);
  
  const { variableName, words } = readFileWords(filePath);
  
  let filteredWords = words;
  
  // 如果是 otherNames.ts，需要过滤掉已处理的词
  if (isOtherNames) {
    filteredWords = words.filter(word => !processedWords.has(word));
  }
  
  // 去重
  const uniqueWords = Array.from(new Set(filteredWords));
  uniqueWords.sort();
  
  // 计算统计信息
  const originalCount = words.length;
  const optimizedCount = uniqueWords.length;
  const removedCount = originalCount - optimizedCount;
  
  // 更新已处理的词集合（不包括 otherNames.ts 的词）
  if (!isOtherNames) {
    uniqueWords.forEach(word => processedWords.add(word));
  }
  
  // 写回优化后的内容
  writeOptimizedFile(filePath, variableName, uniqueWords);
  
  // 更新总体统计
  totalStats.totalFiles++;
  totalStats.totalOriginalLines += originalCount;
  totalStats.totalOptimizedLines += optimizedCount;
  totalStats.totalRemovedLines += removedCount;
  
  // 输出文件统计信息
  console.log(`  原行数: ${originalCount}`);
  console.log(`  优化后行数: ${optimizedCount}`);
  console.log(`  去重行数: ${removedCount}`);
  console.log("");
  
  return {
    filePath,
    originalCount,
    optimizedCount,
    removedCount
  };
}

// 处理单个语言目录
function processLanguageDirectory(directoryPath: string): void {
  const directoryName = directoryPath.split(/[\\/]/).pop() || "";
  console.log(`\n=== 开始处理 ${directoryName} 语言目录 ===`);
  
  // 读取目录下的所有文件
  const files = readdirSync(directoryPath);
  
  // 分离 otherNames.ts 和其他文件
  let otherNamesFile: string | null = null;
  const otherFiles: string[] = [];
  
  for (const file of files) {
    const filePath = join(directoryPath, file);
    const stats = statSync(filePath);

    if (stats.isFile() && extname(file) === ".ts" && file !== "index.ts") {
      if (file.toLowerCase() === "othernames.ts") {
        otherNamesFile = filePath;
      } else {
        otherFiles.push(filePath);
      }
    }
  }
  
  // 已处理的词集合
  const processedWords = new Set<string>();
  
  // 先处理除 otherNames.ts 外的所有文件
  console.log(`\n处理 ${directoryName} 目录下的其他文件...`);
  otherFiles.forEach(filePath => {
    optimizeSingleFile(filePath, processedWords);
  });
  
  // 最后处理 otherNames.ts 文件
  if (otherNamesFile) {
    console.log(`\n处理 ${directoryName} 目录下的 otherNames.ts 文件...`);
    optimizeSingleFile(otherNamesFile, processedWords, true);
  } else {
    console.log(`\n${directoryName} 目录下没有 otherNames.ts 文件`);
  }
  
  console.log(`=== ${directoryName} 语言目录处理完成 ===\n`);
}

// 执行优化
console.log("开始优化词库...\n");

// 读取 lexicon 目录下的所有子目录
const lexiconDirs = readdirSync(LEXICON_DIR).filter(dir => {
  const dirPath = join(LEXICON_DIR, dir);
  return statSync(dirPath).isDirectory();
});

// 处理每个语言目录
lexiconDirs.forEach(dir => {
  const dirPath = join(LEXICON_DIR, dir);
  processLanguageDirectory(dirPath);
});

// 输出总体统计信息
console.log("=== 优化总体统计 ===");
console.log(`总优化文件数: ${totalStats.totalFiles}`);
console.log(`总原始行数: ${totalStats.totalOriginalLines}`);
console.log(`总优化后行数: ${totalStats.totalOptimizedLines}`);
console.log(`总去重行数: ${totalStats.totalRemovedLines}`);
console.log("====================");
console.log("所有词库文件优化完成!");