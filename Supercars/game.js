let playerDeck = [];
let cpuDeck = [];
let currentAttribute = '';

// 1. 初始化游戏：读取新的 cars.json 数据
fetch('cars.json')
    .then(response => response.json())
    .then(data => {
        let shuffledDeck = data.sort(() => Math.random() - 0.5); // 随机洗牌
        playerDeck = shuffledDeck.slice(0, 16); // 分给玩家16张
        cpuDeck = shuffledDeck.slice(16, 32);   // 分给电脑16张
        updateUI();
    });

// 更新界面显示
function updateUI() {
    if (playerDeck.length === 0) { alert("你输了！你的车库被清空了。"); return; }
    if (cpuDeck.length === 0) { alert("恭喜！你赢得了所有顶级超跑！"); return; }

    document.getElementById('player-count').innerText = playerDeck.length;
    document.getElementById('cpu-count').innerText = cpuDeck.length;

    let pCard = playerDeck[0];
    document.getElementById('player-name').innerText = pCard.name;
    
    // 2. 绑定玩家超跑数据到 UI
    document.getElementById('p-power').innerText = pCard.power;
    document.getElementById('p-top_speed').innerText = pCard.top_speed;
    document.getElementById('p-acceleration').innerText = pCard.acceleration;
    document.getElementById('p-torque').innerText = pCard.torque;
    document.getElementById('p-rarity').innerText = pCard.rarity;
    
    // 图片路径配置：这里假设您的图片放在 images 文件夹，并以车辆 id 命名，例如 "1.jpg"
    document.getElementById('player-img').src = `images/${pCard.id}.jpg`;

    // 电脑牌先重置为问号
    let cCard = cpuDeck[0];
    document.getElementById('cpu-name').innerText = "???";
    document.getElementById('c-power').innerText = "?";
    document.getElementById('c-top_speed').innerText = "?";
    document.getElementById('c-acceleration').innerText = "?";
    document.getElementById('c-torque').innerText = "?";
    document.getElementById('c-rarity').innerText = "?";
    document.getElementById('cpu-img').src = ``;
    document.getElementById('cpu-card').classList.add('hidden-card');
    
    // 重置中间的提示文字
    document.getElementById('round-result').innerText = "选择一项车辆属性发起比拼！";
}

// 玩家点击属性进行对决
function playRound(attribute) {
    let pCard = playerDeck[0];
    let cCard = cpuDeck[0];
    
    // 展示电脑真实数据
    document.getElementById('cpu-name').innerText = cCard.name;
    document.getElementById('c-power').innerText = cCard.power;
    document.getElementById('c-top_speed').innerText = cCard.top_speed;
    document.getElementById('c-acceleration').innerText = cCard.acceleration;
    document.getElementById('c-torque').innerText = cCard.torque;
    document.getElementById('c-rarity').innerText = cCard.rarity;
    document.getElementById('cpu-img').src = `images/${cCard.id}.jpg`;
    document.getElementById('cpu-card').classList.remove('hidden-card');

    let pValue = pCard[attribute];
    let cValue = cCard[attribute];
    let resultText = "";

    // 3. 核心输赢逻辑判定
    let playerWins = false;
    let isTie = (pValue === cValue);

    if (!isTie) {
        // 如果比拼的是 0-100加速，数值越小越厉害
        if (attribute === 'acceleration') {
            playerWins = pValue < cValue; 
        } else {
            // 其他属性依然是数值越大越厉害
            playerWins = pValue > cValue; 
        }
    }

    // 结算结果
    if (playerWins) {
        resultText = `你的 ${pValue} 战胜了对手的 ${cValue}！赢下这辆车！`;
        playerDeck.push(playerDeck.shift(), cpuDeck.shift()); // 赢家收走两张牌放到牌底
    } else if (!isTie && !playerWins) {
        resultText = `你的 ${pValue} 不敌对手的 ${cValue}！痛失爱车！`;
        cpuDeck.push(cpuDeck.shift(), playerDeck.shift()); // 对手赢走
    } else {
        resultText = "平局！势均力敌，车辆各自返回车库。";
        playerDeck.push(playerDeck.shift());
        cpuDeck.push(cpuDeck.shift());
    }

    document.getElementById('round-result').innerText = resultText;
    
    // 延迟 2.5 秒后进入下一回合
    setTimeout(updateUI, 2500);
}
