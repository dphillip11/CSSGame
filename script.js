var DEBUG = false;

function showDebug() {
    if (DEBUG) {
        document.documentElement.style.setProperty('--border-color', 'red');
    }
}

showDebug();

var gameWindow = document.getElementById("game-window");

var previousTime = Date.now();

var actionInterval = 0.5;
var actionTime = 0;
var isDoingAction = false;
var isSlashing = false;
var isPlaying = false;
    
var score = 0;
var health = 3;
var coinPower = 0;
var multiplier = 1;
var x2multiplierThreshold = 8;
var x4multiplierThreshold = 16;

var x2 = document.getElementById("x2");
var x4 = document.getElementById("x4");
var multiplierBar = document.getElementById("multiplier-bar");

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

function IncreaseCoinPower() {
    coinPower ++;
    if (coinPower >= x2multiplierThreshold) {
        multiplier = 2;
        x2.classList.add("unlocked")
    }
    if (coinPower >= x4multiplierThreshold) {
        multiplier = 4;
        x4.classList.add("unlocked")
    }
    var barLength = Math.min(coinPower / x4multiplierThreshold, 1);
    multiplierBar.style.width = (barLength * 100) + "%";
}

function ResetCoinPower() {
    coinPower = 0;
    multiplier = 1;
    x2.classList.remove("unlocked");
    x4.classList.remove("unlocked");
    multiplierBar.style.width = "0%";
}

function GetRandom(min, max) {
    return Math.random() * (max - min) + min;
}
        
var man = document.getElementById("man");
var whale = document.getElementById("whale-container");
var seagull = document.getElementById("seagull");
var bitcoin = document.getElementById("bitcoin");
var brokenBitcoin = document.getElementById("broken-bitcoin");

function ResetPosition(object)
{
    object.style.left = "150%";
    if (object == seagull)
        object.style.top = "50%";
}

function ResetGame() {
    ChangeHealth(3 - health);
    ChangeScore(-score);
    ResetPosition(whale);
    ResetPosition(seagull);
    ResetPosition(bitcoin);
    ResetPosition(brokenBitcoin);
    LaunchObject();
    ResetCoinPower();
    previousTime = Date.now(); 
}

var manHitbox = document.getElementById("man_hitbox");
var hurtbox = document.querySelector(".hurtbox");

var whaleHitbox = document.getElementById("whale_hitbox");
var seagullHitbox = document.getElementById("seagull_hitbox");
var bitcoinHitbox = document.getElementById("bitcoin_hitbox");

var launchedObject;
var baseMovementSpeed = 80;
var maxSpeed = 200;
var movementSpeed = baseMovementSpeed;

function SetRandomMovementSpeed() {
    var extraSpeed = GetRandom(0, (multiplier * score) / 4)
    movementSpeed = Math.min(baseMovementSpeed + extraSpeed, maxSpeed);
}

function LaunchObject() {
    var objectIndex = (Math.floor)(Math.random() * 3);
    switch (objectIndex) {
        case 0: launchedObject = whale; break;
        case 1: launchedObject = seagull; break;
        case 2: launchedObject = bitcoin; break;
        case 3: launchedObject = bitcoin; break;
    }
    SetRandomMovementSpeed();
}

function moveLaunchedObject(distance) {
    var x = launchedObject.style.left = parseFloat(launchedObject.style.left) || 110;
    x -= distance;
    launchedObject.style.left = x + "%";
    if (x < -50) {
        ResetPosition(launchedObject);
        if (launchedObject != bitcoin) {
            ChangeScore(1 * multiplier);
        }
        else {
            ResetCoinPower();
        }
        LaunchObject();
        return;
    }
    if (launchedObject == seagull)
    {
        var y = 25;
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
    man.className = "sprite man-jumping";
    manHitbox.classList.add("jumping");
}

function slash() {
    man.className = "sprite man-slashing";
    manHitbox.classList.add("slashing");
    hurtbox.style.display = "block";
    isSlashing = true;
}

function duck() {
    man.className = "sprite man-ducking";
    manHitbox.classList.add("ducking");
}

function decoratedAction(action, event)
{
    if (isDoingAction || !isPlaying) {
        return;
    }
    if(event)
        event.preventDefault();
    action();
    isDoingAction = true;
}

function duckAction(event) {
    decoratedAction(duck, event);
}
function jumpAction(event) {
    decoratedAction(jump, event);
}
function slashAction(event) {
    decoratedAction(slash, event);
}

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
var helpButton = document.getElementById("help-button");
var helpShowing = false;
var notificationText = document.getElementById("notification");

function ToggleHelp()
{
    touchControls.forEach(function(touchControl) {
    touchControl.classList.toggle("hidden");
    });
    helpShowing = !helpShowing;
    notificationText.innerText = helpShowing ? "Tap, click or press the keys to play" : "";
}

helpButton.addEventListener('click', function() {
    ToggleHelp();
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

var startButton = document.getElementById("start-button");
startButton.addEventListener('click', startGame, false); 
var restartButton = document.getElementById("restart-button");
restartButton.addEventListener('click', startGame, false);


function UpdateMan(dt) {
    if (isDoingAction) {
        actionTime += dt;
        if (actionTime > actionInterval) {
            actionTime = 0;
            isDoingAction = false;
            isSlashing = false;
            man.className = "sprite man-standing";
            manHitbox.className = "hitbox";
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
        IncreaseCoinPower();
        brokenBitcoin.style.left = bitcoin.style.left;
        ResetPosition(launchedObject);
        launchedObject = brokenBitcoin;
    }
}
        

function GameOver() {
    notificationText.innerText = "Game Over";
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

function gameLoop() {
    var currentTime = Date.now();
    var dt = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    updateGame(dt);
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (helpShowing) {
        ToggleHelp();
    }
    notificationText.innerText = "";
    startButton.style.display = "none";
    restartButton.style.display = "none";
    isPlaying = true;
    ResetGame();
    LaunchObject();
    gameLoop();
}
