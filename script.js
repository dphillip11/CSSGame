var actionInterval = 0.5;
var actionTime = 0;
var isDoingAction = false;
var isSlashing = false;
    
var score = 0;
var health = 3;

var scoreText = document.getElementById("score");
var healthText = document.getElementById("health");

function ChangeScore(amount) {
    score += amount;
    scoreText.innerHTML = "Score: " + score;
}

function ChangeHealth(amount) {
    health += amount;
    healthText.innerHTML = "Health: " + health;
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

window.addEventListener('keydown', function (event) {
    if (isDoingAction) {
        return;
    }
    if (event.key == 'w') {
        man.style.backgroundImage = 'url("Textures/man_jump.png")';
        manHitbox.classList.add("jumping");
    }
    else if (event.key == 'd') {
        man.style.backgroundImage = 'url("Textures/man_hit.png")';
        hurtbox.style.display = "block";
        isSlashing = true;
    }
    else if (event.key == 's') {
        man.style.backgroundImage = 'url("Textures/man_duck.png")';
        manHitbox.classList.add("ducking");
    }
    isDoingAction = true;
}, false);


function UpdateMan(dt) {
    if (isDoingAction) {
        actionTime += dt;
        if (actionTime > actionInterval) {
            actionTime = 0;
            isDoingAction = false;
            isSlashing = false;
            man.style.backgroundImage = 'url("Textures/man_stand.png")';
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
    }
}
        

function GameOver() {
}

function updateGame(dt) {
    if (health <= 0) {
        GameOver();
    }
    UpdateMan(dt);
    checkCollisions();
    moveLaunchedObject(movementSpeed * dt);
}

var previousTime = Date.now();

function gameLoop() {
    var currentTime = Date.now();
    var dt = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    updateGame(dt);
    requestAnimationFrame(gameLoop);
}

LaunchObject();
gameLoop();
