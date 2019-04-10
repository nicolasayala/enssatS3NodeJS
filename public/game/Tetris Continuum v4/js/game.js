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

///////////////////////////////////
let speedBoost=9;
let movingSpeed=4;
//keyCooldown[keyCode] = 2;

let nextFallingPieces=[];

//Keys
let inputKeys = {
    LEFT:   37,
    UP:     38,
    RIGHT:  39,
    DOWN:   40,
    SPACE:  32,
    ENTER:  13
};

let keyCooldown = {};
for(let key in inputKeys)
    keyCooldown[inputKeys[key]]=-1;
function keyDownHandler(event) {
    "use strict";
    let keyCode = event.keyCode;
    for (let key in inputKeys) {
        if (inputKeys[key] === keyCode) {
            if(keyCooldown[keyCode]<0){
                keyCooldown[keyCode] = 0;
            }
            event.preventDefault();
        }
    }
}
function keyUpHandler(event) {
    "use strict";
    let keyCode = event.keyCode;
    for (let key in inputKeys){
        if (inputKeys[key] === keyCode) {
            keyCooldown[keyCode] = -1;
        }
    }

}
// score
let score;

// squares
let squares;


let fallingPiece;


function gameover() {
    let url = "/games/scores?game=Tetris Continuum v3";
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
    ctxArena.setAttribute("height", CanHeight);
    ctxArena.setAttribute("width", CanWidth);
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

    animFrame( recursiveAnim );

}

window.addEventListener("load", init, false);
