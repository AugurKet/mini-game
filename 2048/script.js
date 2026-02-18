const board=document.getElementById("board");
const scoreEl=document.getElementById("score");
const bestEl=document.getElementById("best");
const overlay=document.getElementById("overlay");
const msg=document.getElementById("message");

let grid,score,best,prev;
let won=false;

/* SOUND ENGINE */

const ctx=new (window.AudioContext||window.webkitAudioContext)();

function beep(freq){
let o=ctx.createOscillator();
let g=ctx.createGain();

o.connect(g);
g.connect(ctx.destination);

o.frequency.value=freq;
o.start();

g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.15);
o.stop(ctx.currentTime+.15);
}

/* HAPTIC */

function vibrate(ms=10){
if(navigator.vibrate) navigator.vibrate(ms);
}

/* INIT */

function restart(){

grid=Array(4).fill().map(()=>Array(4).fill(0));
score=0;
prev=null;
won=false;

best=localStorage.best2048||0;
bestEl.textContent=best;

add();add();
draw();
}

/* DRAW */

function draw(){

board.innerHTML="";

grid.flat().forEach(v=>{
let t=document.createElement("div");
t.className="tile";

if(v){
t.textContent=v;
t.classList.add("v"+v);
}else{
t.style.background="rgba(255,255,255,.03)";
}

board.appendChild(t);
});

scoreEl.textContent=score;

if(score>best){
best=score;
bestEl.textContent=best;
localStorage.best2048=best;
}
}

/* GAME LOGIC */

function add(){

let empty=[];

grid.forEach((r,i)=>{
r.forEach((c,j)=>{
if(!c) empty.push([i,j]);
});
});

if(!empty.length) return;

let [r,c]=empty[Math.random()*empty.length|0];
grid[r][c]=Math.random()<.9?2:4;
}

function slide(row){

row=row.filter(Boolean);

for(let i=0;i<row.length-1;i++){

if(row[i]===row[i+1]){

row[i]*=2;
score+=row[i];
row[i+1]=0;

beep(220+row[i]);
vibrate(12);

if(row[i]===2048 && !won){
won=true;
show("You Win!");
}
}
}

row=row.filter(Boolean);

while(row.length<4) row.push(0);

return row;
}

function rotate(){
grid=grid[0].map((_,i)=>grid.map(r=>r[i])).reverse();
}

function move(dir){

prev=JSON.stringify(grid);
let before=JSON.stringify(grid);

if(dir==="up") rotate();
if(dir==="right") rotate(),rotate();
if(dir==="down") rotate(),rotate(),rotate();

for(let i=0;i<4;i++)
grid[i]=slide(grid[i]);

if(dir==="up") rotate(),rotate(),rotate();
if(dir==="right") rotate(),rotate();
if(dir==="down") rotate();

if(before!==JSON.stringify(grid)){

add();
draw();

if(gameOver()) setTimeout(()=>show("Game Over"),120);
}
}

function undo(){
if(prev){
grid=JSON.parse(prev);
draw();
}
}

function gameOver(){

for(let r=0;r<4;r++){
for(let c=0;c<4;c++){

if(grid[r][c]===0) return false;

if(c<3 && grid[r][c]===grid[r][c+1]) return false;
if(r<3 && grid[r][c]===grid[r+1][c]) return false;
}
}
return true;
}

/* UI */

function show(t){
msg.textContent=t;
overlay.classList.remove("hidden");
}

function continueGame(){
overlay.classList.add("hidden");
}

/* INPUT — keyboard */

document.addEventListener("keydown",e=>{

if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))
e.preventDefault();

if(e.key==="ArrowUp") move("up");
if(e.key==="ArrowDown") move("down");
if(e.key==="ArrowLeft") move("left");
if(e.key==="ArrowRight") move("right");
});

/* TOUCH — blocks iOS navigation */

let sx,sy;

document.addEventListener("touchstart",e=>{
sx=e.touches[0].clientX;
sy=e.touches[0].clientY;
},{passive:false});

document.addEventListener("touchmove",e=>{
e.preventDefault();
},{passive:false});

document.addEventListener("touchend",e=>{

let dx=e.changedTouches[0].clientX-sx;
let dy=e.changedTouches[0].clientY-sy;

if(Math.abs(dx)>Math.abs(dy)){
dx>0?move("right"):move("left");
}else{
dy>0?move("down"):move("up");
}

},{passive:false});

restart();
