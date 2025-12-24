import dts from 'rollup-plugin-dts'
import alias from '@rollup/plugin-alias'
import esbuild from 'rollup-plugin-esbuild'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy'

const tsConfig = {
	respectExternal: false,
	exclude: ["test/**/*.ts"],
}

const plugins = [
	alias(),
	resolve(),
	typescript(tsConfig),
	esbuild({
		target: 'es2022', // 设置为 ES2022 以确保使用 const/let
		minifySyntax: true, // 压缩时保留现代语法
	}),
	terser()
];

// 核心模块配置
const coreConfig = {
	input: 'src/core/index.ts',
	output: [
		{
			file: 'dist/lib/core.d.ts',
			format: 'esm',
			sourcemap: false,
		},
	],
	plugins: [dts(tsConfig)],
};

const coreConfigJs = {
	input: 'src/core/index.ts',
	output: [
		{
			file: 'dist/lib/core.js',
			format: 'esm',
			sourcemap: false,
		},
		{
			file: 'dist/lib/core.cjs',
			format: 'cjs',
			sourcemap: false,
		},
	],
	plugins: [...plugins]
};

// 共享的 external 函数
const externalFunction = (id) => {
	// 将词库模块和核心模块标记为外部依赖
	return id.includes('/lexicon')|| id.includes('/core');
};

// 词库模块配置 - 与其他模块保持一致的打包方式
const lexiconConfig = {
	input: 'src/lexicon/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/lexicon.d.ts',
			format: 'esm',
			sourcemap: false
		},
	],
	plugins: [dts(tsConfig)],
};

const lexiconConfigJs = {
	input: 'src/lexicon/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/lexicon.js',
			format: 'esm',
			sourcemap: false
		},
		{
			file: 'dist/lib/lexicon.cjs',
			format: 'cjs',
			sourcemap: false
		},
	],
	plugins: [...plugins]
};

// 主入口配置（快速使用模块）
const mainConfig = {
	input: 'src/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/index.d.ts',
			format: 'esm',
			sourcemap: false,
		},
	],
	plugins: [dts(tsConfig)],
};

const mainConfigJs = {
	input: 'src/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/index.js',
			format: 'esm',
			sourcemap: false,
		},
		{
			file: 'dist/lib/index.cjs',
			format: 'cjs',
			sourcemap: false,
		},
	],
	plugins: [...plugins,
		copy({
			targets: [
				{src: '*.md', dest: 'dist'},
			]
		})
	]
};

export default [
	coreConfig,
	coreConfigJs,
	lexiconConfig,
	lexiconConfigJs,
	mainConfig,
	mainConfigJs
];