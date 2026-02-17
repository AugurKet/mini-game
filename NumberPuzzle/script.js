(() => {

//////////////////////////////////////////////////////
// Canvas 高清（Retina）
//////////////////////////////////////////////////////

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('gameStatus');
const resetBtn = document.getElementById('resetBtn');

function setupCanvas(){
    const ratio = window.devicePixelRatio || 1;

    const w = 900;
    const h = 700;

    canvas.width = w * ratio;
    canvas.height = h * ratio;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(ratio,0,0,ratio,0,0);
}

setupCanvas();

//////////////////////////////////////////////////////
// ⭐⭐⭐ 真 · 旋转方格布局
//////////////////////////////////////////////////////

const GRID = 4;        // 4x4 顶点 → 9个旋转方块
const SPACING = 110;   // 控制松紧（可调）

const vertexCoords = [];

// 生成旋转45°的网格
for(let r=0;r<GRID;r++){
    for(let c=0;c<GRID;c++){

        vertexCoords.push({
            x:(c-r)*SPACING,
            y:(c+r)*SPACING
        });
    }
}

//////////////////////////////////////////////////////
// 居中函数
//////////////////////////////////////////////////////

function getPixel(v){
    return {
        x: canvas.width/2/(window.devicePixelRatio||1) + v.x,
        y: canvas.height/2/(window.devicePixelRatio||1) - 180 + v.y
    };
}

//////////////////////////////////////////////////////
// 构建9个可旋转方块
//////////////////////////////////////////////////////

const diamonds=[];

for(let r=0;r<GRID-1;r++){
    for(let c=0;c<GRID-1;c++){

        const i = r*GRID + c;

        diamonds.push({
            vertices:[
                i,           // 上左
                i+1,         // 上右
                i+GRID+1,    // 下右
                i+GRID       // 下左
            ],
            answer:0,
            top:0
        });
    }
}

//////////////////////////////////////////////////////
// 数字系统
//////////////////////////////////////////////////////

let vertexNumbers = new Array(vertexCoords.length);

function rotateClockwise(v){

    const temp = vertexNumbers[v[0]];

    vertexNumbers[v[0]] = vertexNumbers[v[3]];
    vertexNumbers[v[3]] = vertexNumbers[v[2]];
    vertexNumbers[v[2]] = vertexNumbers[v[1]];
    vertexNumbers[v[1]] = temp;
}

function computeTop(v){
    return v.reduce((s,i)=>s+vertexNumbers[i],0);
}

function updateAll(){
    diamonds.forEach(d=>{
        d.top = computeTop(d.vertices);
    });
}

//////////////////////////////////////////////////////
// ⭐ 打乱（保证有解）
//////////////////////////////////////////////////////

function shuffle(steps=30){
    for(let i=0;i<steps;i++){
        const r = Math.floor(Math.random()*diamonds.length);
        rotateClockwise(diamonds[r].vertices);
    }
}

//////////////////////////////////////////////////////
// 重开
//////////////////////////////////////////////////////

function resetGame(){

    // 生成数字
    for(let i=0;i<vertexNumbers.length;i++){
        vertexNumbers[i] = Math.floor(Math.random()*40)+10;
    }

    // 先计算答案
    updateAll();

    diamonds.forEach(d=>{
        d.answer = d.top;
    });

    // 再打乱
    shuffle(35);

    updateAll();

    draw();
}

//////////////////////////////////////////////////////
// 绘制
//////////////////////////////////////////////////////

const circleRadius = 14;

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // ===== 方块 =====
    diamonds.forEach(d=>{

        const pts = d.vertices.map(i=>getPixel(vertexCoords[i]));

        ctx.beginPath();
        ctx.moveTo(pts[0].x,pts[0].y);
        ctx.lineTo(pts[1].x,pts[1].y);
        ctx.lineTo(pts[2].x,pts[2].y);
        ctx.lineTo(pts[3].x,pts[3].y);
        ctx.closePath();

        ctx.fillStyle = d.top===d.answer
            ? 'rgba(140,230,160,.8)'
            : 'rgba(255,120,120,.75)';

        ctx.fill();

        ctx.strokeStyle="#555";
        ctx.lineWidth=2;
        ctx.stroke();

        // 上数字
        const centerX = (pts[0].x+pts[2].x)/2;
        const centerY = (pts[0].y+pts[2].y)/2;

        ctx.fillStyle="#2c3e50";
        ctx.font="bold 20px Segoe UI";
        ctx.textAlign="center";
        ctx.textBaseline="bottom";
        ctx.fillText(d.top,centerX,centerY-6);

        ctx.fillStyle="#6c2bd9";
        ctx.textBaseline="top";
        ctx.fillText(d.answer,centerX,centerY+6);
    });

    // ===== 圆点 =====
    vertexCoords.forEach((v,i)=>{

        const p=getPixel(v);

        ctx.beginPath();
        ctx.arc(p.x,p.y,circleRadius,0,Math.PI*2);

        ctx.fillStyle="#f4f4f4";
        ctx.fill();

        ctx.strokeStyle="#2b5797";
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.fillStyle="#1e2b36";
        ctx.font="bold 14px monospace";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(vertexNumbers[i],p.x,p.y);
    });

    // 胜利检测
    const win = diamonds.every(d=>d.top===d.answer);

    statusEl.innerText = win
        ? "🎉 全部解锁！"
        : "🔴 继续努力";
}

//////////////////////////////////////////////////////
// 点击检测（非常精准）
//////////////////////////////////////////////////////

canvas.addEventListener('mousedown',handleClick);
canvas.addEventListener('touchstart',handleClick,{passive:false});

function handleClick(e){

    e.preventDefault();

    const rect=canvas.getBoundingClientRect();

    const scaleX = canvas.width/rect.width;
    const scaleY = canvas.height/rect.height;
    const ratio = window.devicePixelRatio||1;

    const cx=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    const cy=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;

    const x = cx*scaleX/ratio;
    const y = cy*scaleY/ratio;

    for(const d of diamonds){

        const pts = d.vertices.map(i=>getPixel(vertexCoords[i]));

        const centerX = (pts[0].x+pts[2].x)/2;
        const centerY = (pts[0].y+pts[2].y)/2;

        if(Math.hypot(x-centerX,y-centerY)<40){

            rotateClockwise(d.vertices);
            updateAll();
            draw();
            return;
        }
    }
}

resetBtn.onclick=resetGame;

resetGame();

})();
