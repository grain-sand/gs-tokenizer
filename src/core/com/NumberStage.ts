import {RegexArrayStageBase} from "./RegexArrayStageBase";
import {cnNumber} from "gs-base";

export const FillCnNum = `壹贰叁肆伍陆柒捌玖拾佰仟十百千万亿萬億兆${cnNumber}`;

const units = ['公斤', '英里', '克', '千克', '吨', '米', '厘米', '毫米', '公里', '斤', '两', '元', '角', '分', '小时', '分钟', '秒', '折', '折扣', '卷', '券', '美元', '人民币', '元', '角', '分', '亩', '公顷', '平方米', '平方分米', '平方厘米', '立方厘米', '升', '毫升', '天', '周', '月', '年', '岁', '度', '瓦', '千瓦', '安培', '伏特', '欧姆', '焦耳', '卡路里', '千克力', '牛', '牛顿', '帕斯卡', '巴', '标准大气压', '毫米汞柱', '摄氏度', '华氏度', '弧度', '角度', 'kg', 'g', 'mg', 't', 'km', 'm', 'cm', 'mm', 'μm', 'nm', 'L', 'mL', 'l', 'ml', 'h', 'min', 's', 'd', 'w', 'y', '°C', '°F', 'rad', 'deg', 'Hz', 'kHz', 'MHz', 'GHz', 'bit', 'Byte', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'lb', 'oz', 'pound', 'pounds'];

export class NumberStage extends RegexArrayStageBase {
	readonly id = 'number';
	readonly order = 6;
	readonly priority = 10;
	readonly skipOwnLastMax: boolean = true;

	protected RegexArray: RegExp[] = [
		new RegExp(`^(?:第|No)?[${FillCnNum}0-9]+(?:[名場场个]|${units.join('|')})?`,'i'),
		/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?%?/i
	]

}

