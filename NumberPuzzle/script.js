const board = document.getElementById("board");

let circles = [];
let diamonds = [];

/* ===== 创建17个圆圈 ===== */

const positions = [
[180,10],

[120,80],[240,80],

[60,150],[180,150],[300,150],

[0,220],[120,220],[240,220],[360,220],

[60,290],[180,290],[300,290],

[120,360],[240,360],

[180,430]
];

positions.forEach(pos=>{

    const el=document.createElement("div");
    el.className="circle";

    const value = rand();
    el.innerText=value;

    el.style.left=pos[0]+"px";
    el.style.top=pos[1]+"px";

    board.appendChild(el);

    circles.push({el,value});
});

/* ===== 每个菱形绑定4个圆圈 ===== */

const diamondMap=[

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

/* ===== 菱形位置 ===== */

const diamondPos=[
[165,55],

[225,125],[105,125],

[285,195],[165,195],[45,195],

[225,265],[105,265],

[165,335]
];

/* ===== 创建菱形 ===== */

diamondMap.forEach((map,i)=>{

    const el=document.createElement("div");
    el.className="diamond";

    el.style.left=diamondPos[i][0]+"px";
    el.style.top=diamondPos[i][1]+"px";

    const top=document.createElement("div");
    const bottom=document.createElement("div");

    top.className="top";
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

/* ===== 初始化答案 ===== */

diamonds.forEach(d=>{
    d.answer = sum(d.map);
});

/* ===== 打乱 ===== */

for(let i=0;i<40;i++){
    rotate(randInt(0,8),false);
}

/* ⭐⭐ VERY IMPORTANT */
update();

/* ===== 点击 ===== */

diamonds.forEach((d,i)=>{

    d.el.onclick=()=>{
        rotate(i,true);
        update();
    }
});

/* ===== 旋转 ===== */

function rotate(index){

    const map = diamonds[index].map;

    const temp = circles[map[3]].value;

    circles[map[3]].value = circles[map[2]].value;
    circles[map[2]].value = circles[map[1]].value;
    circles[map[1]].value = circles[map[0]].value;
    circles[map[0]].value = temp;

    map.forEach(i=>{
        circles[i].el.innerText = circles[i].value;
    });
}

/* ===== 更新数字 ===== */

function update(){

    diamonds.forEach(d=>{

        const s=sum(d.map);

        d.top.innerText=s;
        d.bottom.innerText=d.answer;

        if(s===d.answer){
            d.el.classList.add("correct");
        }else{
            d.el.classList.remove("correct");
        }
    });
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
