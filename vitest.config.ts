import {defineConfig} from 'vitest/config'

export default defineConfig({
	publicDir: './test/files',
	resolve: {
		alias: {
			util: 'util/', // 指向兼容浏览器的 util 包
		},
	},
	optimizeDeps: {
		include: ['util'], // 确保 util 包在依赖优化中被打包
	},
	test: {
		browser: {
			enabled: true,
			instances:[
				{
					browser: "1",
				} as any
			]
		},
		include: ['./test/**/*test*.ts'],
		silent: true
	},
	logLevel: "error"
})
