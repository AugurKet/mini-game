let playerDeck = [];
let cpuDeck = [];

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

    if (pValue > cValue) {
        resultText = `你用 ${pValue} 点战胜了对手的 ${cValue} 点！好汉归你！`;
        playerDeck.push(playerDeck.shift(), cpuDeck.shift());
    } else if (pValue < cValue) {
        resultText = `你的 ${pValue} 点不敌对手的 ${cValue} 点！好汉被抓！`;
        cpuDeck.push(cpuDeck.shift(), playerDeck.shift());
    } else {
        resultText = "不分伯仲！各自退回阵中。";
        playerDeck.push(playerDeck.shift());
        cpuDeck.push(cpuDeck.shift());
    }

    document.getElementById('round-result').innerText = resultText;

    // 延迟 2.5 秒后进入下一回合
    setTimeout(updateUI, 2500);
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
