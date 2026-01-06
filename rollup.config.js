import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy'

const regexReplace = (patterns) => ({
	name: 'regex-replace',
	generateBundle(_, bundle) {
		for (const file of Object.keys(bundle)) {
			const chunk = bundle[file];
			if (chunk.type === 'asset' || chunk.type === 'chunk') {
				let code = chunk.code || chunk.source;
				for (const {find, replacement} of patterns) {
					code = code.replace(find, replacement);
				}
				if (chunk.code) {
					chunk.code = code;
				} else {
					chunk.source = code;
				}
			}
		}
	},
});

const tsConfig = {
	respectExternal: false,
	exclude: ["test/**/*.ts"],
}

// const aliasIns = alias({entries: {find: '../core', replacement: './core'}});
const replace = regexReplace([
	{find: /(['"])([.]+\/)+core\1/g, replacement: `'./core'`},
]);

const plugins = [
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
	return id.includes('/lexicon') || id.includes('/core');
};

// 词库模块配置 - 与其他模块保持一致的打包方式
const lexiconConfig = {
	input: 'src/lexicon/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/lexicon.d.ts',
			format: 'esm',
			sourcemap: false,
		},
	],
	plugins: [
		dts(tsConfig),
		replace
	],

};

const lexiconConfigJs = {
	input: 'src/lexicon/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/lexicon.js',
			format: 'esm',
			sourcemap: false,
		},
		{
			file: 'dist/lib/lexicon.cjs',
			format: 'cjs',
			sourcemap: false,
		},
	],
	plugins: [...plugins, replace]
};

// 主入口配置（快速使用模块）
const mainConfig = {
	input: 'src/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/index.d.ts',
			format: 'esm',
			sourcemap: false
		},
	],
	plugins: [dts({
		...tsConfig,
		compilerOptions: {
			...tsConfig.compilerOptions,
			baseUrl: '.'
		}
	})],
};

const mainConfigJsPlugins = [plugins];

if(process.env.COPY) {
	mainConfigJsPlugins.push(copy({
		targets: [
			{src: '*.md', dest: 'dist'},
		]
	}))
}

const mainConfigJs = {
	input: 'src/index.ts',
	external: externalFunction,
	output: [
		{
			file: 'dist/lib/index.js',
			format: 'esm',
			sourcemap: false
		},
		{
			file: 'dist/lib/index.cjs',
			format: 'cjs',
			sourcemap: false
		},
	],
	plugins: mainConfigJsPlugins
};

export default [
	coreConfig,
	coreConfigJs,
	lexiconConfig,
	lexiconConfigJs,
	mainConfig,
	mainConfigJs
];
