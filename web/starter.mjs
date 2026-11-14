/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { newStory } from './model.mjs';

export const STARTER_KEY = 'weekday-eight-breakfast-v1';
export const STARTER_TITLE = '星期八的早餐店';
export const STARTER_TEXT = '许眠第一次发现那家早餐店，是在一个没有星期几的早晨。\n\n手机上的日期没有变，天气栏却多出一行小字：星期八，适宜重来。\n\n她提着一袋橘子，在巷口站了很久。药房、花店、修表铺，明明都是熟悉的店面，中间却凭空多了一扇薄荷绿色的木门。\n\n门边的小黑板写着：“把一件后悔的事留在这里，第二碗粥免费。”\n\n许眠推门进去。柜台后，一只戴圆眼镜的橘猫正在拨算盘。它抬头看了她一眼，把一张餐券推到她面前。\n\n“来得正好，”橘猫说，“你的明天快凉了。”\n\n靠窗的桌上摆着两套餐具。其中一只碗冒着热气，另一只空碗里，静静躺着她小时候弄丢的那颗玻璃弹珠。\n\n她还没来得及开口，对面的椅子就自己向后挪了一寸。';

export function createStarterStory() {
  const story = newStory(STARTER_TITLE, STARTER_TEXT);
  story.seedKey = STARTER_KEY;
  story.memory = '许眠在熟悉的小巷里发现一家只在星期八营业的早餐店。店主是一只戴圆眼镜的橘猫。店中的食物似乎与人的遗憾和时间有关。';
  story.note = '都市奇幻，温暖又有悬念。第三人称，用对话和细节推进情节，暂时不要一次解释店铺的全部规则。';
  return story;
}
