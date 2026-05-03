let playerDeck = [];
let cpuDeck = [];

// 初始化游戏：读取 JSON 数据
fetch('characters.json')
    .then(response => {
        if (!response.ok) throw new Error("HTTP 错误，状态码: " + response.status);
        return response.json();
    })
    .then(data => {
        console.log("成功读取武林名册：", data);
        let shuffledDeck = data.sort(() => Math.random() - 0.5); // 随机洗牌
        playerDeck = shuffledDeck.slice(0, 16); // 玩家16张
        cpuDeck = shuffledDeck.slice(16, 32);   // 电脑16张
        updateUI(); 
    })
    .catch(error => {
        console.error("读取 JSON 失败:", error);
        document.getElementById('round-result').innerText = "江湖名册加载失败，请按 F12 检查！";
    });

// 更新界面显示
function updateUI() {
    if (playerDeck.length === 0) {
        showEndScreen("败走桃花岛...", "你的侠客被对方赢光了，退隐江湖吧！", false);
        return;
    }
    if (cpuDeck.length === 0) {
        showEndScreen("天下第一！", "恭喜大侠！你赢得了所有侠客，威震武林！", true);
        return;
    }

    document.getElementById('player-count').innerText = playerDeck.length;
    document.getElementById('cpu-count').innerText = cpuDeck.length;

    let pCard = playerDeck[0];
    document.getElementById('player-name').innerText = pCard.name;
    document.getElementById('p-martial').innerText = pCard.martial;
    document.getElementById('p-comprehension').innerText = pCard.comprehension;
    document.getElementById('p-constitution').innerText = pCard.constitution;
    document.getElementById('p-chivalry').innerText = pCard.chivalry;
    document.getElementById('p-loyalty').innerText = pCard.loyalty;
    document.getElementById('p-charisma').innerText = pCard.charisma;
    document.getElementById('player-img').src = `images/${pCard.image}`;

    // 电脑牌先重置为问号
    document.getElementById('cpu-name').innerText = "???";
    document.getElementById('c-martial').innerText = "?";
    document.getElementById('c-comprehension').innerText = "?";
    document.getElementById('c-constitution').innerText = "?";
    document.getElementById('c-chivalry').innerText = "?";
    document.getElementById('c-loyalty').innerText = "?";
    document.getElementById('c-charisma').innerText = "?";
    document.getElementById('cpu-img').src = ``;
    document.getElementById('cpu-card').classList.add('hidden-card');
}

// 玩家点击属性进行对决
function playRound(attribute) {
    let pCard = playerDeck[0];
    let cCard = cpuDeck[0];

    // 展示电脑真实数据
    document.getElementById('cpu-name').innerText = cCard.name;
    document.getElementById('c-martial').innerText = cCard.martial;
    document.getElementById('c-comprehension').innerText = cCard.comprehension;
    document.getElementById('c-constitution').innerText = cCard.constitution;
    document.getElementById('c-chivalry').innerText = cCard.chivalry;
    document.getElementById('c-loyalty').innerText = cCard.loyalty;
    document.getElementById('c-charisma').innerText = cCard.charisma;
    document.getElementById('cpu-img').src = `images/${cCard.image}`;
    document.getElementById('cpu-card').classList.remove('hidden-card');

    let pValue = pCard[attribute];
    let cValue = cCard[attribute];
    let resultText = "";
    let attrName = getAttributeName(attribute);

    if (pValue > cValue) {
        resultText = `你凭 ${pValue} 点【${attrName}】战胜了对手的 ${cValue} 点！获得卡牌！`;
        playerDeck.push(playerDeck.shift(), cpuDeck.shift());
    } else if (pValue < cValue) {
        resultText = `你的 ${pValue} 点【${attrName}】不敌对手的 ${cValue} 点！失去卡牌！`;
        cpuDeck.push(cpuDeck.shift(), playerDeck.shift());
    } else {
        resultText = `【${attrName}】平局！双方不分伯仲，各自收回卡牌。`;
        playerDeck.push(playerDeck.shift());
        cpuDeck.push(cpuDeck.shift());
    }

    document.getElementById('round-result').innerText = resultText;
    
    // 延迟 2.5 秒后进入下一回合
    setTimeout(updateUI, 2500);
}

// 辅助函数：将英文属性名转换为中文播报
function getAttributeName(attr) {
    const map = {
        'martial': '武功', 'comprehension': '悟性', 'constitution': '体质',
        'chivalry': '侠义', 'loyalty': '情义', 'charisma': '魅力'
    };
    return map[attr];
}

// ====== 音乐控制逻辑 ======
let bgmPlaying = false;
function toggleBGM() {
    let bgm = document.getElementById('bgm');
    let btn = document.getElementById('bgm-btn');

    if (bgmPlaying) {
        bgm.pause();
        btn.innerText = " 🎵  播放战歌";
    } else {
        bgm.play();
        btn.innerText = " 🔇  暂停战歌";
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
        titleEl.style.textShadow = "0 0 20px #0088ff, 0 0 40px #00008b";
    }
    document.getElementById('end-screen').classList.add('show');
}
