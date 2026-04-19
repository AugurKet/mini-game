let playerDeck = [];
let cpuDeck = [];
let currentAttribute = '';

// 初始化游戏：读取 JSON 数据
fetch('characters.json')
    .then(response => response.json())
    .then(data => {
        let shuffledDeck = data.sort(() => Math.random() - 0.5); // 随机洗牌
        playerDeck = shuffledDeck.slice(0, 16); // 分给玩家16张
        cpuDeck = shuffledDeck.slice(16, 32);   // 分给电脑16张
        updateUI();
    });

// 更新界面显示
function updateUI() {
    if (playerDeck.length === 0) { alert("你输了！被对方赢光了卡牌。"); return; }
    if (cpuDeck.length === 0) { alert("恭喜！你赢得了所有卡牌！"); return; }

    document.getElementById('player-count').innerText = playerDeck.length;
    document.getElementById('cpu-count').innerText = cpuDeck.length;

    let pCard = playerDeck[0];
    document.getElementById('player-name').innerText = pCard.name;
    document.getElementById('p-force').innerText = pCard.force;
    document.getElementById('p-intelligence').innerText = pCard.intelligence;
    document.getElementById('p-leadership').innerText = pCard.leadership;
    document.getElementById('p-vitality').innerText = pCard.vitality;
    document.getElementById('p-charisma').innerText = pCard.charisma;
    // 图片路径配置
    document.getElementById('player-img').src = Images/${pCard.image};

    // 电脑牌先重置为问号
    let cCard = cpuDeck[0];
    document.getElementById('cpu-name').innerText = "???";
    document.getElementById('c-force').innerText = "?";
    document.getElementById('c-intelligence').innerText = "?";
    document.getElementById('c-leadership').innerText = "?";
    document.getElementById('c-vitality').innerText = "?";
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
    document.getElementById('c-force').innerText = cCard.force;
    document.getElementById('c-intelligence').innerText = cCard.intelligence;
    document.getElementById('c-leadership').innerText = cCard.leadership;
    document.getElementById('c-vitality').innerText = cCard.vitality;
    document.getElementById('c-charisma').innerText = cCard.charisma;
    document.getElementById('cpu-img').src = Images/${cCard.image};
    document.getElementById('cpu-card').classList.remove('hidden-card');

    let pValue = pCard[attribute];
    let cValue = cCard[attribute];
    let resultText = "";

    if (pValue > cValue) {
        resultText = 你用 ${pValue} 点战胜了对手的 ${cValue} 点！你赢得了卡牌！;
        playerDeck.push(playerDeck.shift(), cpuDeck.shift()); // 赢家收走两张牌放到牌底
    } else if (pValue < cValue) {
        resultText = 你的 ${pValue} 点不敌对手的 ${cValue} 点！你失去了卡牌！;
        cpuDeck.push(cpuDeck.shift(), playerDeck.shift());
    } else {
        resultText = "平局！各自将牌放回牌底。";
        playerDeck.push(playerDeck.shift());
        cpuDeck.push(cpuDeck.shift());
    }

    document.getElementById('round-result').innerText = resultText;
    
    // 延迟 2.5 秒后进入下一回合
    setTimeout(updateUI, 2500);
}
