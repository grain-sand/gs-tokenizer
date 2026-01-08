import {RegexArrayStageBase} from "./RegexArrayStageBase";
import {cnNumber} from "gs-base";

export const FillCnNum = `壹贰叁肆伍陆柒捌玖拾佰仟十百千万亿萬億兆${cnNumber}`;

const unitArray = ['公斤', '英里', '千克', '厘米', '毫米', '公里', '小时', '分钟', '折扣', '美元', '人民币', '公顷', '平方米', '平方分米', '平方厘米', '立方厘米', '毫升', '千瓦', '安培', '伏特', '欧姆', '焦耳', '卡路里', '千克力', '牛顿', '帕斯卡', '标准大气压', '毫米汞柱', '摄氏度', '华氏度', '弧度', '角度', 'kg', 'mg', 'km', 'cm', 'mm', 'μm', 'nm', 'mL', 'ml', 'min', '°C', '°F', 'rad', 'deg', 'Hz', 'kHz', 'MHz', 'GHz', 'bit', 'Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'lb', 'oz', 'pound', 'pounds'];
const unitChars = '元名場场个克吨米斤两元角分秒折卷券元角分亩升天周月年岁度瓦牛巴gtmLlhsdwyB';

export class NumberStage extends RegexArrayStageBase {
	readonly id = 'number';
	readonly order = 9;
	readonly priority = 10;
	readonly skipOwnLastMax: boolean = true;

	protected RegexArray: RegExp[] = [
		new RegExp(`^(?:第|No)[${FillCnNum}0-9]+(?:${unitArray.join('|')})`, 'i'),
		new RegExp(`^(?:第|No)[${FillCnNum}0-9]+[${unitChars}]`, 'i'),
		new RegExp(`^[${FillCnNum}0-9]+(?:${unitArray.join('|')})`, 'i'),
		new RegExp(`^[0-9${FillCnNum}]+[${unitChars}]`, 'i'),
		/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?%?/i,
		new RegExp(`^[${FillCnNum}]+`, 'i')
	]

}
