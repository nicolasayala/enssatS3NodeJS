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
//keyCooldown[keyCode] = 2;

let nextFallingPieces=[];

//mouse and touch
let mouse={
	startPos:null,
	pos:null,
	pressed:false,
};

//Keys
let inputKeys = {
    LEFT:   37,
    UP:     38,
    RIGHT:  39,
    DOWN:   40,
    SPACE:  32,
    ENTER:  13
};

function doAction(action){
	if(keyCooldown[keyCode]<0){
		keyCooldown[keyCode] = 0;
	}
}

let keyCooldown = {};
for(let key in inputKeys)
    keyCooldown[inputKeys[key]]=-1;
function keyDownHandler(event) {
    let keyCode = event.keyCode;
    for (let action in inputKeys) {
        if (inputKeys[action] === keyCode) {
			doAction(action);
        }
    }
}
function keyUpHandler(event) {
    let keyCode = event.keyCode;
    for (let key in inputKeys){
        if (inputKeys[key] === keyCode) {
            keyCooldown[keyCode] = -1;
        }
    }
}
function touchStartHandler(event) {
	mouse.pressed=true;
	let x=event.touches[0].pageX;
	let y=event.touches[0].pageY;
	mouse.startPos={x:x, y:y};
	console.log("touchstart"+JSON.stringify(mouse))
}
function touchMoveHandler(event) {
	if(mouse.pressed===false) throw new Error("mouse pressed === false, when touchmove event triggered");
	let x=event.touches[0].pageX;
	let y=event.touches[0].pageY;
	mouse.pos={x:x, y:y};
	console.log("touchmove"+JSON.stringify(mouse))
}
function touchEndHandler(event) {
	mouse.pressed=false;
	console.log("touchend"+JSON.stringify(mouse))
}
// score
let score;

// squares
let squares;


let fallingPiece;


function gameover() {
    let url = "/games/scores?game="+name;
    post(url, {new_score: score});
    // alert("GAME OVER\nscore:"+score);
    stopMainLoop = true;
    location.replace(url);
}

function updateGame() {
    "use strict";

    tics++;

    let dx=0, dy=0;
    for (let keyCode in keyCooldown) {
        if(keyCooldown[keyCode] === 0){
            if(keyCode == inputKeys.LEFT) {
                //keyCooldown[keyCode] = 2;
                dx+=-movingSpeed;
            }
            if(keyCode == inputKeys.RIGHT) {
                //keyCooldown[keyCode] = 2;
                dx+=movingSpeed;
            }
            if(keyCode == inputKeys.UP) {
                keyCooldown[keyCode] = -1;// touch up (not pressed)
                fallingPiece.rotate();
                if(fallingPiece.collide(squares))
                    fallingPiece.rotateBack();
            }
            if(keyCode == inputKeys.DOWN) {
                dy+=speedBoost;
            }
        }else if(keyCooldown[keyCode] > 0){
            keyCooldown[keyCode]--;
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
