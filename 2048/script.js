const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

let grid;
let score;

function init(){
    grid = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];

    score = 0;
    scoreDisplay.textContent = score;

    addNumber();
    addNumber();

    draw();
}

function draw(){
    board.innerHTML="";

    grid.flat().forEach(value=>{
        const tile = document.createElement("div");
        tile.classList.add("tile");

        if(value){
            tile.textContent = value;
            tile.dataset.value = value;
        }

        board.appendChild(tile);
    });
}

function addNumber(){
    let empty=[];

    for(let r=0;r<4;r++){
        for(let c=0;c<4;c++){
            if(grid[r][c]===0){
                empty.push({r,c});
            }
        }
    }

    if(empty.length===0) return;

    let {r,c} = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random()<0.9 ? 2 : 4;
}

function slide(row){
    row = row.filter(v=>v);

    for(let i=0;i<row.length-1;i++){
        if(row[i]===row[i+1]){
            row[i]*=2;
            score+=row[i];
            row[i+1]=0;
        }
    }

    row = row.filter(v=>v);

    while(row.length<4){
        row.push(0);
    }

    return row;
}

function rotate(){
    grid = grid[0].map((_,i)=>grid.map(row=>row[i])).reverse();
}

function move(direction){

    let old = JSON.stringify(grid);

    // rotate board to reuse slide logic
    if(direction==="up") rotate();
    if(direction==="right") rotate(), rotate();
    if(direction==="down") rotate(), rotate(), rotate();

    for(let i=0;i<4;i++){
        grid[i] = slide(grid[i]);
    }

    // rotate back
    if(direction==="up") rotate(), rotate(), rotate();
    if(direction==="right") rotate(), rotate();
    if(direction==="down") rotate();

    if(old!==JSON.stringify(grid)){
        addNumber();
        scoreDisplay.textContent = score;
        draw();

        if(isGameOver()){
            setTimeout(()=>alert("Game Over!"),100);
        }
    }
}

function isGameOver(){

    // empty tile exists
    for(let r=0;r<4;r++){
        for(let c=0;c<4;c++){
            if(grid[r][c]===0) return false;

            if(c<3 && grid[r][c]===grid[r][c+1]) return false;
            if(r<3 && grid[r][c]===grid[r+1][c]) return false;
        }
    }

    return true;
}

document.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
});

/* MOBILE SWIPE */

let startX,startY;

document.addEventListener("touchstart",e=>{
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener("touchend",e=>{

    let dx = e.changedTouches[0].clientX - startX;
    let dy = e.changedTouches[0].clientY - startY;

    if(Math.abs(dx)>Math.abs(dy)){
        dx>0 ? move("right") : move("left");
    }else{
        dy>0 ? move("down") : move("up");
    }
});

function restartGame(){
    init();
}

init();
