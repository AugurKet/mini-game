(() => {

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('gameStatus');
const resetBtn = document.getElementById('resetBtn');

//////////////////////////////////////////////////
// ⭐⭐⭐ Retina 高清修复（非常重要）
//////////////////////////////////////////////////

function setupCanvas(){
    const ratio = window.devicePixelRatio || 1;
    const width = 900;
    const height = 700;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(ratio,0,0,ratio,0,0);
}

setupCanvas();

//////////////////////////////////////////////////
// 布局参数
//////////////////////////////////////////////////

const spacing = 90;
const offsetX = 320;
const offsetY = 220;
const circleRadius = 16;

//////////////////////////////////////////////////
// 菱形布局
//////////////////////////////////////////////////

const diamondPositions = [
    {r:0,c:2},
    {r:1,c:1},{r:1,c:2},
    {r:2,c:0},{r:2,c:1},{r:2,c:2},
    {r:3,c:1},{r:3,c:2},
    {r:4,c:2}
];

//////////////////////////////////////////////////
// 构建顶点
//////////////////////////////////////////////////

const vertexMap = new Map();
const vertexCoords = [];

diamondPositions.forEach(d=>{
    [
        {r:d.r-1,c:d.c},
        {r:d.r+1,c:d.c},
        {r:d.r,c:d.c-1},
        {r:d.r,c:d.c+1}
    ].forEach(n=>{
        const key=n.r+','+n.c;
        if(!vertexMap.has(key)){
            vertexMap.set(key,vertexCoords.length);
            vertexCoords.push(n);
        }
    });
});

let vertexNumbers = new Array(vertexCoords.length);

const diamonds = diamondPositions.map(pos=>{
    const up=vertexMap.get((pos.r-1)+','+pos.c);
    const down=vertexMap.get((pos.r+1)+','+pos.c);
    const left=vertexMap.get(pos.r+','+(pos.c-1));
    const right=vertexMap.get(pos.r+','+(pos.c+1));

    return {
        ...pos,
        vertices:[up,right,down,left],
        answer:0,
        top:0
    };
});

//////////////////////////////////////////////////
// 游戏逻辑
//////////////////////////////////////////////////

function rotateClockwise(v){
    const t = vertexNumbers[v[0]];
    vertexNumbers[v[0]] = vertexNumbers[v[3]];
    vertexNumbers[v[3]] = vertexNumbers[v[2]];
    vertexNumbers[v[2]] = vertexNumbers[v[1]];
    vertexNumbers[v[1]] = t;
}

function computeTop(v){
    return v.reduce((s,i)=>s+vertexNumbers[i],0);
}

function updateAll(){
    diamonds.forEach(d=>{
        d.top = computeTop(d.vertices);
    });
}

function shuffle(steps=25){ // ⭐更乱
    for(let i=0;i<steps;i++){
        const r = Math.floor(Math.random()*diamonds.length);
        rotateClockwise(diamonds[r].vertices);
    }
}

function resetGame(){

    for(let i=0;i<vertexNumbers.length;i++){
        vertexNumbers[i] = Math.floor(Math.random()*40)+10;
    }

    updateAll();

    diamonds.forEach(d=>{
        d.answer = d.top;
    });

    shuffle();

    updateAll();

    draw();
}

//////////////////////////////////////////////////
// 绘制
//////////////////////////////////////////////////

function getPixel(r,c){
    return {
        x:c*spacing+offsetX,
        y:r*spacing+offsetY
    };
}

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // diamonds
    diamonds.forEach(d=>{
        const pts=d.vertices.map(v=>getPixel(vertexCoords[v].r,vertexCoords[v].c));

        ctx.beginPath();
        ctx.moveTo(pts[0].x,pts[0].y);
        ctx.lineTo(pts[1].x,pts[1].y);
        ctx.lineTo(pts[2].x,pts[2].y);
        ctx.lineTo(pts[3].x,pts[3].y);
        ctx.closePath();

        ctx.fillStyle = d.top===d.answer
            ? 'rgba(120,220,120,.7)'
            : 'rgba(255,120,120,.7)';

        ctx.fill();
        ctx.strokeStyle="#555";
        ctx.stroke();

        const center=getPixel(d.r,d.c);

        ctx.fillStyle="#2c3e50";
        ctx.font="bold 20px Segoe UI";
        ctx.textAlign="center";
        ctx.textBaseline="bottom";
        ctx.fillText(d.top,center.x,center.y-6);

        ctx.fillStyle="#8e44ad";
        ctx.textBaseline="top";
        ctx.fillText(d.answer,center.x,center.y+6);
    });

    // circles
    vertexCoords.forEach((v,i)=>{
        const {x,y}=getPixel(v.r,v.c);

        ctx.beginPath();
        ctx.arc(x,y,circleRadius,0,Math.PI*2);
        ctx.fillStyle="#f0f0f0";
        ctx.fill();
        ctx.strokeStyle="#2b5797";
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.fillStyle="#1e2b36";
        ctx.font="bold 14px monospace";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(vertexNumbers[i],x,y);
    });

    const win = diamonds.every(d=>d.top===d.answer);
    statusEl.innerText = win ? "🎉 全部解锁！" : "🔴 继续努力";
}

//////////////////////////////////////////////////
// 点击
//////////////////////////////////////////////////

canvas.addEventListener('mousedown',click);
canvas.addEventListener('touchstart',click,{passive:false});

function click(e){

    e.preventDefault();

    const rect=canvas.getBoundingClientRect();
    const scaleX=canvas.width/rect.width;
    const scaleY=canvas.height/rect.height;

    const cx=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    const cy=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;

    const x=cx*scaleX/(window.devicePixelRatio||1);
    const y=cy*scaleY/(window.devicePixelRatio||1);

    for(const d of diamonds){
        const center=getPixel(d.r,d.c);
        if(Math.hypot(x-center.x,y-center.y)<32){
            rotateClockwise(d.vertices);
            updateAll();
            draw();
            break;
        }
    }
}

resetBtn.onclick=resetGame;

resetGame();

})();
