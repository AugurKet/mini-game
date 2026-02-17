const board = document.getElementById("board");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");

let circles = [];
let diamonds = [];

let moves = 0;
let timer = 0;
let interval;

/* ========= 坐标生成 ========= */

const positions = [
    [180,0],

    [120,70],[240,70],

    [60,140],[180,140],[300,140],

    [0,210],[120,210],[240,210],[360,210],

    [60,280],[180,280],[300,280],

    [120,350],[240,350],

    [180,420]
];

/* ===== 建立圆圈 ===== */

positions.forEach((pos,i)=>{

    const el = document.createElement("div");
    el.className="circle";

    const value = rand();
    el.innerText=value;

    el.style.left=pos[0]+"px";
    el.style.top=pos[1]+"px";

    board.appendChild(el);

    circles.push({
        el,
        value
    });

});

/* ===== 菱形结构 ===== */
/* 每个菱形引用四个circle index */

const diamondMap = [

[0,1,3,4],

[1,2,4,5],
[3,4,6,7],

[4,5,7,8],
[6,7,9,10],
[7,8,10,11],

[9,10,12,13],
[10,11,13,14],

[12,13,15,16]

];

/* 菱形坐标 */

const diamondPos = [
[165,45],

[225,115],[105,115],

[285,185],[165,185],[45,185],

[225,255],[105,255],

[165,325]
];

/* ===== 创建菱形 ===== */

diamondMap.forEach((map,i)=>{

    const el=document.createElement("div");
    el.className="diamond";

    el.style.left=diamondPos[i][0]+"px";
    el.style.top=diamondPos[i][1]+"px";

    const top=document.createElement("div");
    top.className="top";

    const bottom=document.createElement("div");
    bottom.className="bottom";

    el.appendChild(top);
    el.appendChild(bottom);

    board.appendChild(el);

    diamonds.push({
        el,
        top,
        bottom,
        map,
        answer:0
    });

});

/* ===== 初始化答案（保证可解）===== */

diamonds.forEach(d=>{
    d.answer = sum(d.map);
});

/* 打乱局面 */

for(let i=0;i<30;i++){
    rotate(randInt(0,8),false);
}

update();

/* ===== 点击旋转 ===== */

diamonds.forEach((d,i)=>{

    d.el.onclick=()=>{

        if(!interval){
            interval=setInterval(()=>{
                timer++;
                timerEl.innerText=timer;
            },1000);
        }

        rotate(i,true);
        update();
        checkWin();
    }
});

/* ===== 旋转逻辑 ===== */

function rotate(index,countMove){

    const map = diamonds[index].map;

    const temp = circles[map[3]].value;

    circles[map[3]].value = circles[map[2]].value;
    circles[map[2]].value = circles[map[1]].value;
    circles[map[1]].value = circles[map[0]].value;
    circles[map[0]].value = temp;

    map.forEach(i=>{
        circles[i].el.innerText=circles[i].value;
    });

    if(countMove){
        moves++;
        movesEl.innerText=moves;
    }
}

/* ===== 更新显示 ===== */

function update(){

    diamonds.forEach(d=>{

        const s = sum(d.map);

        d.top.innerText = s;
        d.bottom.innerText = d.answer;

        if(s===d.answer){
            d.el.classList.add("correct");
        }else{
            d.el.classList.remove("correct");
        }
    });
}

/* ===== 胜利检测 ===== */

function checkWin(){

    const win = diamonds.every(d=>
        sum(d.map)===d.answer
    );

    if(win){

        clearInterval(interval);

        setTimeout(()=>{
            alert(`完成！\n时间:${timer}s\n步数:${moves}`);
        },200);
    }
}

/* ===== 工具 ===== */

function sum(map){
    return map.reduce((a,i)=>a+circles[i].value,0);
}

function rand(){
    return Math.floor(Math.random()*40)+11;
}

function randInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}