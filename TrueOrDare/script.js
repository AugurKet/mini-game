// script.js
// 老虎机抽题：01–50，不重复抽取，温和题库（真心话/大冒险）

const numberEl = document.getElementById('number');
const promptEl = document.getElementById('prompt');
const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const leftCountEl = document.getElementById('leftCount');
const historyEl = document.getElementById('history');
const typePill = document.getElementById('typePill');

const pad2 = (n) => String(n).padStart(2, '0');

// 50 张卡：每张卡 = { id: 1..50, type: 'truth'|'dare', text: '...' }
const deckOriginal = [
  { id: 1,  type:'truth', text:'你最近一次说过的善意谎言是什么？' },
  { id: 2,  type:'dare',  text:'用 10 秒把你右手边的人夸到脸红（友善版）。' },
  { id: 3,  type:'truth', text:'你最想学会但一直拖着没学的技能是什么？' },
  { id: 4,  type:'dare',  text:'用“播音腔”读出你手机里最新一条讯息（可隐去敏感部分）。' },
  { id: 5,  type:'truth', text:'如果明天放假一天，你会怎么安排？' },
  { id: 6,  type:'dare',  text:'模仿一种动物走路 8 秒。' },
  { id: 7,  type:'truth', text:'你最怕别人误会你什么？' },
  { id: 8,  type:'dare',  text:'发明一个全场都要跟着做的手势口号（持续到游戏结束）。' },
  { id: 9,  type:'truth', text:'你最喜欢自己的一个优点是什么？' },
  { id:10,  type:'dare',  text:'闭眼原地转三圈，然后走向你觉得最近的人击掌。' },

  { id:11,  type:'truth', text:'你最想回到哪一年？为什么？' },
  { id:12,  type:'dare',  text:'用“霸总/女总裁”语气对某人说一句日常话。' },
  { id:13,  type:'truth', text:'你做过最冲动的一次决定是什么？' },
  { id:14,  type:'dare',  text:'用 3 句话讲一个烂笑话故事（让大家笑或叹气都算成功）。' },
  { id:15,  type:'truth', text:'你最近一次感到幸福的瞬间是什么？' },
  { id:16,  type:'dare',  text:'做一次“30 秒广告”，推销你手边的一样物品。' },
  { id:17,  type:'truth', text:'你最想对过去的自己说一句什么？' },
  { id:18,  type:'dare',  text:'用“唱歌”的方式说出你的名字或昵称。' },
  { id:19,  type:'truth', text:'你暗自羡慕过别人什么？' },
  { id:20,  type:'dare',  text:'摆一个“电影海报姿势”10 秒，大家帮你取片名。' },

  { id:21,  type:'truth', text:'如果只能吃一种食物一个月，你选什么？' },
  { id:22,  type:'dare',  text:'用 15 秒做一段“慢动作”表演（自由发挥）。' },
  { id:23,  type:'truth', text:'你最不擅长拒绝什么？' },
  { id:24,  type:'dare',  text:'用 3 个词形容你左手边的人（要友善）。' },
  { id:25,  type:'truth', text:'你曾经最想放弃的一件事是什么？后来怎样了？' },
  { id:26,  type:'dare',  text:'用“奇怪口音/方言”说一句“大家辛苦了”。' },
  { id:27,  type:'truth', text:'你手机里最常用的 App 是哪个？为什么？' },
  { id:28,  type:'dare',  text:'让大家给你定一个新外号，你要接受并用到结束。' },
  { id:29,  type:'truth', text:'你最想拥有哪种超能力？同时附带一个小副作用。' },
  { id:30,  type:'dare',  text:'站起来做 5 个你自创的“胜利动作”。' },

  { id:31,  type:'truth', text:'你最后悔买过的东西是什么？' },
  { id:32,  type:'dare',  text:'把你当前的表情定格 10 秒不许笑。' },
  { id:33,  type:'truth', text:'如果能立刻精通一种乐器，你选哪个？' },
  { id:34,  type:'dare',  text:'用“新闻主播”语气播报现场发生的一件小事。' },
  { id:35,  type:'truth', text:'你最想养成的一个生活习惯是什么？' },
  { id:36,  type:'dare',  text:'随机选一个人，拳头碰拳头并说一句鼓励话。' },
  { id:37,  type:'truth', text:'你最爱的放松方式是什么？' },
  { id:38,  type:'dare',  text:'用 10 秒把你今天的心情演成哑剧。' },
  { id:39,  type:'truth', text:'你觉得自己最像哪种天气？为什么？' },
  { id:40,  type:'dare',  text:'用一句话向全场“道歉”，但必须超级离谱又不伤人。' },

  { id:41,  type:'truth', text:'你最喜欢别人怎么称呼你？' },
  { id:42,  type:'dare',  text:'让大家投票你要做哪个表情：酷/萌/凶/傻，坚持 15 秒。' },
  { id:43,  type:'truth', text:'你最不愿意别人触碰的一个界限是什么？' },
  { id:44,  type:'dare',  text:'用 10 秒跳一段“你以为很帅/很美”的舞。' },
  { id:45,  type:'truth', text:'如果你写自传，标题会是什么？' },
  { id:46,  type:'dare',  text:'对着空气“接电话”演一段 15 秒戏（内容随你编）。' },
  { id:47,  type:'truth', text:'你这辈子最想感谢的人是谁？原因一句就好。' },
  { id:48,  type:'dare',  text:'用 3 种不同情绪说“我没事”（开心/委屈/生气）。' },
  { id:49,  type:'truth', text:'你最近一个小目标是什么？' },
  { id:50,  type:'dare',  text:'带领全场一起做一个 5 秒团队口号并击掌结束。' },
];

let deck = [];
let spinning = false;
let spinTimer = null;
let currentRollingNumber = 1;

function shuffle(arr){
  // Fisher-Yates
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function setLeft(){
  leftCountEl.textContent = String(deck.length);
}

function setTypePill(type){
  typePill.classList.remove('hidden');
  typePill.textContent = (type === 'truth') ? '真心话' : '大冒险';
}

function resetAll(){
  deck = shuffle(deckOriginal);
  historyEl.innerHTML = '';
  spinning = false;
  clearInterval(spinTimer);
  spinTimer = null;
  numberEl.textContent = '--';
  promptEl.textContent = '点击「开始」抽取本局第一题';
  typePill.classList.add('hidden');
  spinBtn.textContent = '开始';
  spinBtn.classList.remove('stop');
  setLeft();
}

function startSpin(){
  if(deck.length === 0){
    promptEl.textContent = '本局 50 题已抽完。点击「重置」重新开始。';
    return;
  }
  spinning = true;
  spinBtn.textContent = '停止';
  spinBtn.classList.add('stop');

  // 快速滚动显示（仅视觉效果）
  spinTimer = setInterval(()=>{
    currentRollingNumber = (currentRollingNumber % 50) + 1;
    numberEl.textContent = pad2(currentRollingNumber);
  }, 60);
}

function stopSpin(){
  spinning = false;
  spinBtn.textContent = '开始';
  spinBtn.classList.remove('stop');
  clearInterval(spinTimer);
  spinTimer = null;

  // 从牌库抽一张（不重复）
  const card = deck.shift();
  numberEl.textContent = pad2(card.id);
  setTypePill(card.type);
  promptEl.textContent = card.text;

  const li = document.createElement('li');
  li.textContent = `${pad2(card.id)}｜${card.type === 'truth' ? '真心话' : '大冒险'}：${card.text}`;
  historyEl.prepend(li);

  setLeft();

  if(deck.length === 0){
    // 最后一题抽完提示
    const endLi = document.createElement('li');
    endLi.textContent = '✅ 本局已抽完 50 题，点击「重置」可重新洗牌。';
    historyEl.prepend(endLi);
  }
}

spinBtn.addEventListener('click', ()=>{
  if(!spinning) startSpin();
  else stopSpin();
});

resetBtn.addEventListener('click', resetAll);

// 初始化
resetAll();
