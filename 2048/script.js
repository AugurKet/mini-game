const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");

let grid, score, best, previous;
let won = false;

/* INIT */

function restart(){

    grid = Array(4).fill().map(()=>Array(4).fill(0));
    score = 0;
    won = false;
    previous = null;

    best = localStorage.getItem("best2048") || 0;
    bestEl.textContent = best;

    add();
    add();

    draw();
}

function draw(){

    board.innerHTML="";

    grid.flat().forEach(v=>{
        const d=document.createElement("div");

        d.className="tile";

        if(v){
            d.textContent=v;
            d.classList.add("v"+v);
        }else{
            d.style.background="#020617";
        }

        board.appendChild(d);
    });

    scoreEl.textContent=score;

    if(score>best){
        best=score;
        bestEl.textContent=best;
        localStorage.setItem("best2048",best);
    }
}

/* GAME LOGIC */

function add(){

    let empty=[];

    grid.forEach((row,r)=>{
        row.forEach((c,col)=>{
            if(!c) empty.push([r,col]);
        });
    });

    if(!empty.length) return;

    let [r,c]=empty[Math.floor(Math.random()*empty.length)];
    grid[r][c]=Math.random()<.9?2:4;
}

function slide(row){

    row=row.filter(Boolean);

    for(let i=0;i<row.length-1;i++){
        if(row[i]===row[i+1]){
            row[i]*=2;
            score+=row[i];
            row[i+1]=0;

            if(row[i]===2048 && !won){
                won=true;
                showModal("You Win!");
            }
        }
    }

    row=row.filter(Boolean);

    while(row.length<4) row.push(0);

    return row;
}

function rotate(){
    grid = grid[0].map((_,i)=>grid.map(r=>r[i])).reverse();
}

function move(dir){

    previous = JSON.stringify(grid);

    let before = JSON.stringify(grid);

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

        if(gameOver())
            setTimeout(()=>showModal("Game Over"),150);
    }
}

function undo(){
    if(previous){
        grid = JSON.parse(previous);
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

function showModal(text){
    modalText.textContent=text;
    modal.classList.remove("hidden");
}

/* INPUT */

document.addEventListener("keydown",e=>{

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))
        e.preventDefault();

    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
});

/* TOUCH — BLOCK IOS NAVIGATION */

let sx,sy;

document.addEventListener("touchstart",e=>{
    sx=e.touches[0].clientX;
    sy=e.touches[0].clientY;
},{passive:false});

document.addEventListener("touchmove",e=>{
    e.preventDefault(); // 🔥 critical for iOS
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

/* CLOSE MODAL ON TAP */

modal.addEventListener("click",()=>{
    modal.classList.add("hidden");
});

restart();
