var DEBUG = false;

function showDebug() {
    if (DEBUG) {
        document.documentElement.style.setProperty('--border-color', 'red');
    }
}

var actionInterval = 0.5;
var actionTime = 0;
var isDoingAction = false;
var isSlashing = false;
var isPlaying = false;
    
var score = 0;
var health = 3;

var scoreText = document.getElementById("score");
var healthText = document.getElementById("health");

function ChangeScore(amount) {
    score += amount;
    scoreText.innerHTML = "Score: " + score;
}

var hearts = document.querySelectorAll(".heart");

function ChangeHealth(amount) {
  health += amount;
  hearts.forEach(function(heart, index) {
    if (index < health) {
      heart.style.display = "block";
    } else {
      heart.style.display = "none";
    }
  });
}

function GetRandom(min, max) {
    return Math.random() * (max - min) + min;
}
        
var man = document.getElementById("man");
var whale = document.getElementById("whale");
var seagull = document.getElementById("seagull");
var bitcoin = document.getElementById("bitcoin");

function ResetPosition(object)
{
    object.style.left = "110%";
    if (object == seagull)
        object.style.top = "40%";
}

function ResetGame() {
    ChangeHealth(3 - health);
    ChangeScore(-score);
    ResetPosition(whale);
    ResetPosition(seagull);
    ResetPosition(bitcoin);
}

var manHitbox = document.getElementById("man_hitbox");
var hurtbox = document.querySelector(".hurtbox");

var whaleHitbox = document.getElementById("whale_hitbox");
var seagullHitbox = document.getElementById("seagull_hitbox");
var bitcoinHitbox = document.getElementById("bitcoin_hitbox");

var launchedObject;
var movementSpeed = 50;

function SetRandomMovementSpeed() {
    movementSpeed = GetRandom(50, 150);
}

function LaunchObject() {
    var objectIndex = (Math.floor)(Math.random() * 3);
    switch (objectIndex) {
        case 0: launchedObject = whale; break;
        case 1: launchedObject = seagull; break;
        case 2: launchedObject = bitcoin; break;
    }
    SetRandomMovementSpeed();
}

function moveLaunchedObject(distance) {
    var x = launchedObject.style.left = parseFloat(launchedObject.style.left) || 110;
    x -= distance;
    launchedObject.style.left = x + "%";
    if (x < -10) {
        ResetPosition(launchedObject);
        LaunchObject();
        if (launchedObject != bitcoin) {
            ChangeScore(1);
        }
        return;
    }
    if (launchedObject == seagull)
    {
        var y = 40;
        var descent = 20 - x/2;
        if (descent > 0)
            y += descent;
        launchedObject.style.top = y + "%";
    }
}

function CollideWithPlayer() {
    ResetPosition(launchedObject);
    ChangeHealth(-1);
    playHurtAnimation();
}

function checkCollision(a, b)
{
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(aRect.top > bRect.bottom ||
             aRect.bottom < bRect.top ||
             aRect.right < bRect.left ||
             aRect.left > bRect.right);
}

function playHurtAnimation()
{
    man.classList.remove("hurting");
    void man.offsetWidth;
    man.classList.add("hurting");
}

function jump() {
    man.style.backgroundImage = 'url("Textures/man_jump.webp")';
    manHitbox.classList.add("jumping");
}

function slash() {
    man.style.backgroundImage = 'url("Textures/man_hit.webp")';
    hurtbox.style.display = "block";
    isSlashing = true;
}

function duck() {
    man.style.backgroundImage = 'url("Textures/man_duck.webp")';
    manHitbox.classList.add("ducking");
}

function decoratedAction(action)
{
    if (isDoingAction || !isPlaying) {
        return;
    }
    action();
    isDoingAction = true;
}

function duckAction() { decoratedAction(duck); }
function jumpAction() { decoratedAction(jump); }
function slashAction() { decoratedAction(slash); }

var slashButton = document.getElementById("slash");
var jumpButton = document.getElementById("jump");
var duckButton = document.getElementById("duck");

slashButton.addEventListener('click', slashAction, false);
jumpButton.addEventListener('click', jumpAction, false);
duckButton.addEventListener('click', duckAction, false);
slashButton.addEventListener('touchstart', slashAction, false);
jumpButton.addEventListener('touchstart', jumpAction, false);
duckButton.addEventListener('touchstart', duckAction, false);

var touchControls = document.querySelectorAll(".touch_control");
var helpButton = document.getElementById("help");
var helpText = document.getElementById("helpText");

helpButton.addEventListener('click', function() {
  touchControls.forEach(function(touchControl) {
    touchControl.classList.toggle("hidden");
  });
    helpText.classList.toggle("hidden");
}, false);



window.addEventListener('keydown', function (event) {
    if (event.key == 'w') {
        jumpAction();
    }
    else if (event.key == 'd') {
        slashAction();
    }
    else if (event.key == 's') {
        duckAction();
    }
}, false);

var startButton = document.getElementById("start");
startButton.addEventListener('click', startGame, false); 
var restartButton = document.getElementById("restart");
restartButton.addEventListener('click', startGame, false);
var gameOver = document.getElementById("gameover");


function UpdateMan(dt) {
    if (isDoingAction) {
        actionTime += dt;
        if (actionTime > actionInterval) {
            actionTime = 0;
            isDoingAction = false;
            isSlashing = false;
            man.style.backgroundImage = 'url("Textures/man_stand.webp")';
            manHitbox.classList.remove("jumping");
            manHitbox.classList.remove("ducking");
            hurtbox.style.display = "none";
        }
    }
}
        
function checkCollisions() {
    var hit = false;
    if (checkCollision(manHitbox, whaleHitbox) || checkCollision(manHitbox, seagullHitbox)) {
        CollideWithPlayer();
    }
    if (isSlashing && checkCollision(hurtbox, bitcoinHitbox)) {
        ChangeScore(5);
        ResetPosition(launchedObject);
        LaunchObject();
    }
}
        

function GameOver() {
    gameOver.style.display = "block";
    restartButton.style.display = "block";
    isPlaying = false;
}

function updateGame(dt) {
    if (health <= 0) {
        GameOver();
    }
    if (isPlaying) {
        UpdateMan(dt);
        checkCollisions();
        moveLaunchedObject(movementSpeed * dt);
    }
}

var previousTime = Date.now();

function gameLoop() {
    var currentTime = Date.now();
    var dt = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    updateGame(dt);
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameOver.style.display = "none";
    startButton.style.display = "none";
    restartButton.style.display = "none";
    isPlaying = true;
    ResetGame();
    LaunchObject();
    gameLoop();
}
