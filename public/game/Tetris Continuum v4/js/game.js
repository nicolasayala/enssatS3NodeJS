let animFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    null;

let tics = 0;

//constantes
const SQUARE_SIZE=35;
const NB_LINE=24;
const NB_COL=7;
const CanWidth = 700;
const CanHeight = 500;
const GameWidth = NB_COL*SQUARE_SIZE;
const GameHeight = 500;

//Canvas
let divArena;
let ctxArena;
var stopMainLoop = false;
var gameName = "Tetris Continuum v4";


///////////////////////////////////
let speedBoost=9;
let movingSpeed=4;
//actionCooldown[keyCode] = 2;

let nextFallingPieces=[];

//mouse and touch
let mouse={
	startPos:null,
	pos:null,
	pressed:false,
};

let keyToAction = {
    37:"LEFT",
    38:"UP",
    39:"RIGHT",
    40:"DOWN",
};

function enableAction(action){
    //console.log("enable action "+action);
    if(actionCooldown[action]!==undefined)
        if(actionCooldown[action]<0){
            actionCooldown[action] = 0;
        }
}
function disableAction(action){
    //console.log("disable action "+action);
    if(actionCooldown[action]!==undefined)
        actionCooldown[action] = -1;//TODO correction ability to spam (bypass cooldown)
}

function getActionForMouse(){
    if(mouse.startPos===null || mouse.pos ===null) return null;//throw new Error("startPos or pos null");
    let dx = mouse.pos.x - mouse.startPos.x;
    let dy = mouse.pos.y - mouse.startPos.y;
    if(dx*dx + dy*dy < 20*20) return null; //threshold for detecting movement
    if(dx*dx>dy*dy){ //horizontal movement (square for absolute value)
        if(dx>0) return "RIGHT";
        else return "LEFT";
    }else{ //vertical movement
        if(dy<0) return "UP";
        else return "DOWN";
    }
}

/**
 * Number :
 *   -1 action disable
 *   0 action enable
 *   >0 action postpone
 * @type {{ACTION:Number}}
 */
let actionCooldown = {};
for(let key in keyToAction)
    actionCooldown[keyToAction[key]]=-1;

function keyDownHandler(event) {
    let keyCode = event.keyCode;
    let action = keyToAction[keyCode];
    if(action!==undefined)
        enableAction(action);
}
function keyUpHandler(event) {
    let keyCode = event.keyCode;
    let action = keyToAction[keyCode];
    if(action!==undefined)
        disableAction(action);
}
function touchStartHandler(event) {
	mouse.pressed=true;
	let x=event.touches[0].pageX;
	let y=event.touches[0].pageY;
	mouse.startPos={x:x, y:y};
}
function touchMoveHandler(event) {
    if(mouse.pressed===false) throw new Error("mouse pressed === false, when touchmove event triggered");
    let oldAction = getActionForMouse();
    let x=event.touches[0].pageX;
    let y=event.touches[0].pageY;
    mouse.pos={x:x, y:y};
    let action = getActionForMouse();
    if(action!==oldAction){
		disableAction(oldAction);
		enableAction(action);
	}
}
function touchEndHandler(event) {
    disableAction(getActionForMouse());
    mouse.startPos=null;
    mouse.pos=null;
    mouse.pressed=false;
}
// score
let score;

// squares
let squares;


let fallingPiece;


function gameover() {
    let url = "/games/scores?game="+gameName;
    post(url, {new_score: score});
    // alert("GAME OVER\nscore:"+score);
    stopMainLoop = true;
    location.replace(url);
}

function updateGame() {
    "use strict";

    tics++;

    let dx=0, dy=0;
    for (let action in actionCooldown) {
        if(actionCooldown[action] === 0){
            if(action === "LEFT") {
                //actionCooldown[action] = 2;
                dx+=-movingSpeed;
            }
            if(action === "RIGHT") {
                //actionCooldown[action] = 2;
                dx+=movingSpeed;
            }
            if(action === "UP") {
                actionCooldown[action] = -1;// touch up (not pressed)
                fallingPiece.rotate();
                if(fallingPiece.collide(squares))
                    fallingPiece.rotateBack();
            }
            if(action === "DOWN") {
                dy+=speedBoost;
            }
        }else if(actionCooldown[action] > 0){
            actionCooldown[action]--;
        }
    }
    dy+=1;//going done naturally
    fallingPiece.moveAndCollide(dx,dy, squares);

    if(fallingPiece.falling === false){
        //put all squares of the falling piece in the static "grid"
        let p=fallingPiece;
        for(let s of p.pattern.squares) {
            let finalS = new Square(p.pos.x+s.x*SQUARE_SIZE, p.pos.y+s.y*SQUARE_SIZE, p.color);
            squares[p.lineNumber-s.y].push(finalS);
        }

        let nbLinesRm = removeCompleteLines(squares);
        score += nbLinesRm*nbLinesRm;

        if(fallingPiece.pos.y<0){
            gameover();
        }

        //new falling piece
        fallingPiece = nextFallingPiece();
    }
}

function clearGame() {
    "use strict";
    ctxArena.clearRect(GameWidth+10,0,300,50);

    fallingPiece.clear(ctxArena);
    for(let y in squares) {
        for (let s of squares[y]) {
            ctxArena.clearRect(s.x, linePos(y), SQUARE_SIZE, SQUARE_SIZE);
        }
    }
    //next Falling pieces
    for(let i in nextFallingPieces){
        nextFallingPieces[i].clear(ctxArena);
    }
}

function drawGame() {
    "use strict";
    //ctxArena.fillText("life : " + nbOfLives, 150, 25);
    ctxArena.fillText("score : " + score, GameWidth+10 ,25);

    // game
    fallingPiece.draw(ctxArena);
    for(let y in squares) {
        for (let s of squares[y]) {
            ctxArena.fillStyle = s.color;
            ctxArena.fillRect(s.x, linePos(y), SQUARE_SIZE, SQUARE_SIZE);
        }
    }
    //next Falling pieces
    let offset = -Math.min(0, fallingPiece.center.y);
    for(let i in nextFallingPieces){
        nextFallingPieces[i].pos.x=GameWidth+10;
        nextFallingPieces[i].pos.y=40+i*SQUARE_SIZE*2+offset;
        nextFallingPieces[i].draw(ctxArena);
    }
    ctxArena.fillStyle = "black";
    ctxArena.fillRect(GameWidth, 0, 3, GameHeight);
}


function mainloop () {
    "use strict";
    clearGame();
    updateGame();
    drawGame();
}

function recursiveAnim () {
    "use strict";
    mainloop();
    if(!stopMainLoop)
        animFrame( recursiveAnim );
}

function init() {
    "use strict";
    divArena = document.getElementById("arena");
    ctxArena = document.createElement("canvas");
    ctxArena.setAttribute("id", "canArena");
    ctxArena.setAttribute("height", window.innerHeight);
    ctxArena.setAttribute("width", window.innerWidth);
    divArena.appendChild(ctxArena);
    ctxArena = ctxArena.getContext("2d");
    ctxArena.fillStyle = "rgb(200,0,0)";
    ctxArena.font = 'bold 12pt Courier';


    nextFallingPieces.push(randomFallingPiece());
    nextFallingPieces.push(randomFallingPiece());
    nextFallingPieces.push(randomFallingPiece());
    fallingPiece = nextFallingPiece();
    score = 0;
    squares = [];
    for(let i=0; i<NB_LINE; i++)
        squares.push([]);


    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);
    window.addEventListener("touchstart", touchStartHandler, false);
    window.addEventListener("touchmove", touchMoveHandler, false);
    window.addEventListener("touchend", touchEndHandler, false);

    animFrame( recursiveAnim );

}

window.addEventListener("load", init, false);
