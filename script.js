let canvas, ctx;

let gameOver = false;
let score = 0;

let frame = 0;
let speed = 5;

let loopId = null;
let loopRunning = false;

const player = {
    x: 80,
    y: 300,
    w: 40,
    h: 60,
    vy: 0,
    gravity: 0.8,
    jump: -12,
    grounded: false
};

const enemies = [];

function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: 330,
        w: 30,
        h: 30,
        speed: speed
    });
}

// 🎨 personagem
function drawPlayer() {
    ctx.fillStyle = "#ff6b81";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#f1c27d";
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y - 10, 10, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    if (gameOver) return;

    frame++;

    // 🔥 velocidade aumenta com o TEMPO (correto)
    speed = 5 + Math.floor(frame / 300);

    // física
    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y >= 300) {
        player.y = 300;
        player.vy = 0;
        player.grounded = true;
    }

    // inimigos
    enemies.forEach((e, i) => {
        e.x -= e.speed;

        if (
            player.x < e.x + e.w &&
            player.x + player.w > e.x &&
            player.y < e.y + e.h &&
            player.y + player.h > e.y
        ) {
            gameOver = true;
        }

        if (e.x + e.w < 0) {
            enemies.splice(i, 1);
            score++;
        }
    });

    // spawn dinâmico com tempo
    let spawnRate = Math.max(90 - Math.floor(frame / 120), 35);

    if (frame % spawnRate === 0) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // chão
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 360, canvas.width, 40);

    drawPlayer();

    // inimigos
    ctx.fillStyle = "#ff3b3b";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);
    });

    // HUD
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Speed: " + speed, 20, 50);
    ctx.fillText("Time: " + Math.floor(frame / 60) + "s", 20, 70);

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 250, 200);

        ctx.font = "20px Arial";
        ctx.fillText("Pressione R para reiniciar", 220, 240);
    }
}

// 🔥 LOOP ÚNICO (SEM DUPLICAÇÃO)
function loop() {
    update();
    draw();

    loopId = requestAnimationFrame(loop);
}

function startLoop() {
    if (loopRunning) return;

    loopRunning = true;
    loop();
}

function reset() {
    gameOver = false;
    score = 0;
    frame = 0;
    speed = 5;

    enemies.length = 0;

    player.y = 300;
    player.vy = 0;

    if (loopId) {
        cancelAnimationFrame(loopId);
        loopId = null;
    }

    loopRunning = false;

    startLoop();
}

// 🚀 inicialização
window.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    window.addEventListener("keydown", (e) => {
        if ((e.code === "Space" || e.code === "ArrowUp") && player.grounded && !gameOver) {
            player.vy = player.jump;
            player.grounded = false;
        }

        if (e.code === "KeyR" && gameOver) {
            reset();
        }
    });

    reset();
});