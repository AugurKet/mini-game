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
        console.log("成功读取数据：", data); // 这一行会在浏览器的幕后打印成功信息
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
    
    // 注意：这里已经严格匹配了你截图里的大写 Images 文件夹
    document.getElementById('player-img').src = `Images/${pCard.image}`;

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
    
    // 注意：这里已经严格匹配了你截图里的大写 Images 文件夹
    document.getElementById('cpu-img').src = `Images/${cCard.image}`;
    document.getElementById('cpu-card').classList.remove('hidden-card');

    let pValue = pCard[attribute];
    let cValue = cCard[attribute];
    let resultText = "";

    if (pValue > cValue) {
        resultText = `你用 ${pValue} 点战胜了对手的 ${cValue} 点！你赢得了卡牌！`;
        playerDeck.push(playerDeck.shift(), cpuDeck.shift()); 
    } else if (pValue < cValue) {
        resultText = `你的 ${pValue} 点不敌对手的 ${cValue} 点！你失去了卡牌！`;
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
