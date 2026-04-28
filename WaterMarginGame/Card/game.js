let playerDeck = [];
let cpuDeck = [];
let isAnimating = false; // 新增：防止狂点的状态锁

// 初始化游戏：读取 JSON 数据
fetch('characters.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP 错误，状态码: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("成功读取数据：", data);
        let shuffledDeck = data.sort(() => Math.random() - 0.5); // 随机洗牌
        playerDeck = shuffledDeck.slice(0, 16); // 分给玩家16张
        cpuDeck = shuffledDeck.slice(16, 32);   // 分给电脑16张
        updateUI(); // 开始更新界面
    })
    .catch(error => {
        console.error("读取 JSON 失败:", error);
        document.getElementById('round-result').innerText = "数据加载失败，请按 F12 检查！";
    });

// 更新界面显示
function updateUI() {
    if (playerDeck.length === 0) {
        showEndScreen("发配沧州...", "你的好汉全被抓了，大聚义失败！", false);
        return;
    }
    if (cpuDeck.length === 0) {
        showEndScreen("聚义梁山！", "恭喜哥哥！你集齐了所有好汉，替天行道！", true);
        return;
    }

    document.getElementById('player-count').innerText = playerDeck.length;
    document.getElementById('cpu-count').innerText = cpuDeck.length;

    let pCard = playerDeck[0];
    document.getElementById('player-name').innerText = pCard.name;
    document.getElementById('p-strength').innerText = pCard.strength;
    document.getElementById('p-dexterity').innerText = pCard.dexterity;
    document.getElementById('p-wisdom').innerText = pCard.wisdom;
    document.getElementById('p-integrity').innerText = pCard.integrity;
    document.getElementById('p-mercy').innerText = pCard.mercy;
    document.getElementById('p-courage').innerText = pCard.courage;
    document.getElementById('player-img').src = `images/${pCard.image}`;

    // 电脑牌先重置为问号
    document.getElementById('cpu-name').innerText = "???";
    document.getElementById('c-strength').innerText = "?";
    document.getElementById('c-dexterity').innerText = "?";
    document.getElementById('c-wisdom').innerText = "?";
    document.getElementById('c-integrity').innerText = "?";
    document.getElementById('c-mercy').innerText = "?";
    document.getElementById('c-courage').innerText = "?";
    document.getElementById('cpu-img').src = ``;
    document.getElementById('cpu-card').classList.add('hidden-card');
}

// 玩家点击属性进行对决
function playRound(attribute) {
    // 如果正在播放动画，直接无视玩家的点击，防止报错
    if (isAnimating) return; 
    isAnimating = true; // 上锁

    let pCard = playerDeck[0];
    let cCard = cpuDeck[0];

    // 展示电脑真实数据
    document.getElementById('cpu-name').innerText = cCard.name;
    document.getElementById('c-strength').innerText = cCard.strength;
    document.getElementById('c-dexterity').innerText = cCard.dexterity;
    document.getElementById('c-wisdom').innerText = cCard.wisdom;
    document.getElementById('c-integrity').innerText = cCard.integrity;
    document.getElementById('c-mercy').innerText = cCard.mercy;
    document.getElementById('c-courage').innerText = cCard.courage;
    document.getElementById('cpu-img').src = `images/${cCard.image}`;
    document.getElementById('cpu-card').classList.remove('hidden-card');

    let pValue = pCard[attribute];
    let cValue = cCard[attribute];
    let resultText = "";

    // 获取播报文字和玩家的卡牌元素
    let resultEl = document.getElementById('round-result');
    let playerCardEl = document.getElementById('player-card');

    // 每次比拼前，先清除上一回合的颜色和抖动状态
    resultEl.classList.remove('text-win', 'text-lose', 'text-draw');
    playerCardEl.classList.remove('shake-effect');

    // 强制浏览器重绘（确保连续输的时候，每次都能重新抖动）
    void playerCardEl.offsetWidth; 

    if (pValue > cValue) {
        resultText = `你用 ${pValue} 点战胜了对手的 ${cValue} 点！好汉归你！`;
        resultEl.classList.add('text-win'); // 赢：加青色代码
        playerDeck.push(playerDeck.shift(), cpuDeck.shift());
    } else if (pValue < cValue) {
        resultText = `你的 ${pValue} 点不敌对手的 ${cValue} 点！好汉被抓！`;
        resultEl.classList.add('text-lose'); // 输：加红色代码
        playerCardEl.classList.add('shake-effect'); // 输：卡牌抖动
        cpuDeck.push(cpuDeck.shift(), playerDeck.shift());
    } else {
        resultText = "不分伯仲！各自退回阵中。";
        resultEl.classList.add('text-draw'); // 平局：加黄色代码
        playerDeck.push(playerDeck.shift());
        cpuDeck.push(cpuDeck.shift());
    }

    resultEl.innerText = resultText;

    // 延迟 2.5 秒后进入下一回合
    setTimeout(() => {
        updateUI();
        // 恢复默认播报文字和颜色
        resultEl.classList.remove('text-win', 'text-lose', 'text-draw');
        resultEl.innerText = "点击你的属性开始比拼！";
        isAnimating = false; // 解锁，允许下一次点击
    }, 2500);
}

// ====== 音乐控制逻辑 ======
let bgmPlaying = false;
function toggleBGM() {
    let bgm = document.getElementById('bgm');
    let btn = document.getElementById('bgm-btn');

    if (bgmPlaying) {
        bgm.pause();
        btn.innerText = " 🎵  播放好汉歌";
    } else {
        bgm.play();
        btn.innerText = " 🔇  暂停好汉歌";
    }
    bgmPlaying = !bgmPlaying;
}

// 召唤游戏结束画面
function showEndScreen(title, desc, isVictory) {
    document.getElementById('end-title').innerText = title;
    document.getElementById('end-desc').innerText = desc;

    if(!isVictory) {
        let titleEl = document.getElementById('end-title');
        titleEl.style.color = "#aaaaaa";
        titleEl.style.textShadow = "0 0 20px #0000ff, 0 0 40px #4b0082";
    }

    document.getElementById('end-screen').classList.add('show');
}
