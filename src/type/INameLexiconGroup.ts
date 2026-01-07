/**
 * 姓名词库定义接口
 * - 字段必选
 * - 未设置则不加载姓名处理 stage
 */
export interface INameLexiconGroup {
	lastName: string[];
	firstName: string[];
	title: string[];
}
