const routes = document.querySelectorAll('[data-route]');
for (const button of routes) {
  button.addEventListener('click', () => {
    for (const option of routes) {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      document.getElementById(option.dataset.route).hidden = !selected;
    }
  });
}
const outfits = [
  '香芋紫围巾搭米白大衣，拍照时把围巾搭在外面。',
  '藤萝紫毛衣配浅灰外套。怕冷就换同色手套，合照时大家一起挥手。',
  '黑羽绒服配葡萄紫针织帽，走在老街人群里，也能一眼认出你。',
  '梅子紫外套配牛仔裤，或者背一个同色小包，站在紫色队伍最深的那头。'
];
const swatches = document.querySelectorAll('[data-color]');
for (const swatch of swatches) {
  swatch.addEventListener('click', () => {
    for (const option of swatches) option.setAttribute('aria-pressed', String(option === swatch));
    document.getElementById('outfit').textContent = outfits[Number(swatch.dataset.color)];
  });
}
const prizes = [
  ['年度粗粮代言人','颁给每次都说“随便吃点”，却能认真挑上半小时的你。','一颗紫薯'],
  ['年度人形导航','颁给嘴上说“应该是这边”，最后还真能把大家带到饭店的你。','一支紫色记号笔'],
  ['年度抓拍导演','颁给相册里全是我们的丑照，却总能挑出最好看那张的你。','一枚紫色发夹'],
  ['最佳气氛救场奖','颁给群聊安静三分钟，就把所有人逗回来的你。','一包葡萄软糖'],
  ['年度靠谱闹钟','颁给出发前挨个喊醒大家，自己还记得带充电线的你。','一根紫色扎带'],
  ['年度热汤搭子','颁给菜单刚翻开，就知道冬天这桌人需要一碗热汤的你。','一包紫菜'],
  ['最佳集合发起人','颁给把“改天聚聚”变成了“那就这天”的你。','一张紫色便签'],
  ['年度压轴出场奖','颁给一推门，大家就知道可以开饭了的你。','一盒葡萄味口香糖']
];
let last = 0;
let remaining = prizes.slice(1).map((_, index) => index + 1);
document.getElementById('draw').addEventListener('click', () => {
  if (!remaining.length) remaining = prizes.map((_, index) => index);
  const choices = remaining.filter(index => index !== last);
  last = choices[Math.floor(Math.random() * choices.length)];
  remaining = remaining.filter(index => index !== last);
  const [title, citation, gift] = prizes[last];
  document.getElementById('prize').textContent = title;
  document.getElementById('citation').textContent = citation;
  document.getElementById('gift').textContent = '配套奖品 · ' + gift;
});
