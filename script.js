const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let cachedGroundY = 0; 

// CONFIGURAÇÃO INICIAL DO CANVAS
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cachedGroundY = canvas.height - player.h - GROUND_OFFSET;
    if (player.grounded) {
        player.y = cachedGroundY;
    }
}

// =====================
// CARREGAMENTO SEGURO DE IMAGENS
// =====================
const background = new Image();
background.src = "background.png";

const runFrames = [];
for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `run/tile00${i}.png`; 
    runFrames.push(img);
}

const obstacleImg = new Image();
obstacleImg.src = "obstacle.png";

let currentRunFrame = 0;
let animationCounter = 0;
let bgX = 0;

// =====================
// JOGO & PLAYER
// =====================
let gameOver = false;
let score = 0;
let frame = 0;
let speed = 6;

const GROUND_OFFSET = 95;

const player = {
    x: 150,
    y: 0,
    w: 120,
    h: 120,
    vy: 0,
    gravity: 0.8,
    jumpForce: -19,
    grounded: true
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =====================
// INIMIGOS
// =====================
let enemies = [];

function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: cachedGroundY + player.h - 70,
        w: 130,
        h: 130,
        markedForRemoval: false
    });
}

// =====================
// UPDATE 
// =====================
const TARGET_FPS = 60;
const TIME_STEP = 1000 / TARGET_FPS; 

function update(dt) {
    if (gameOver) return;

    const modifier = dt / TIME_STEP;

    frame += modifier;
    speed = 6 + Math.floor(frame / 300);

    // Movimentação do fundo segura
    bgX = (bgX - (speed * 0.3 * modifier)) % canvas.width;

    // Animação do Player
    animationCounter += modifier;
    if (animationCounter >= 5) {
        currentRunFrame++;
        if (currentRunFrame >= runFrames.length || currentRunFrame < 0) {
            currentRunFrame = 0;
        }
        animationCounter = 0;
    }

    // Física do Player
    player.vy += player.gravity * modifier;
    player.y += player.vy * modifier;

    if (player.y >= cachedGroundY) {
        player.y = cachedGroundY;
        player.vy = 0;
        player.grounded = true;
    }

    // Movimentação de Inimigos e Colisão
    enemies.forEach((enemy) => {
        enemy.x -= speed * modifier;

        const hitboxX = enemy.x + 25;
        const hitboxY = enemy.y - 35;
        const hitboxW = 80;
        const hitboxH = 95;

        if (
            player.x + 25 < hitboxX + hitboxW &&
            player.x + player.w - 25 > hitboxX &&
            player.y + 20 < hitboxY + hitboxH &&
            player.y + player.h - 15 > hitboxY
        ) {
            gameOver = true;
        }

        if (enemy.x + enemy.w < 0) {
            enemy.markedForRemoval = true;
            score++;
        }
    });

    if (enemies.length > 0) {
        enemies = enemies.filter(enemy => !enemy.markedForRemoval);
    }

    const spawnRate = Math.max(90 - Math.floor(frame / 120), 35);
    if (Math.floor(frame) % Math.floor(spawnRate) === 0) {
        if (enemies.length === 0 || enemies[enemies.length - 1].x < canvas.width - 250) {
            spawnEnemy();
        }
    }
}

// =====================
// RENDERIZAÇÃO (DRAW)
// =====================
function drawBackground() {
    if (background.complete && background.naturalWidth > 0) {
        ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);
    } else {
        // Se o fundo quebrar, usa uma cor padrão para o jogo rodar
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawPlayer() {
    const activeFrame = runFrames[currentRunFrame];
    
    // Se a imagem do frame atual estiver carregada e válida, desenha
    if (activeFrame && activeFrame.complete && activeFrame.naturalWidth > 0) {
        ctx.drawImage(activeFrame, player.x, player.y, player.w, player.h);
    } else {
        // Se falhar, tenta desenhar o primeiro frame (índice 0) como backup
        const backupFrame = runFrames[0];
        if (backupFrame && backupFrame.complete && backupFrame.naturalWidth > 0) {
            ctx.drawImage(backupFrame, player.x, player.y, player.w, player.h);
        } else {
            // Se NENHUMA imagem carregar na pasta, desenha o boneco como um bloco verde limpo
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (obstacleImg.complete && obstacleImg.naturalWidth > 0) {
            ctx.drawImage(obstacleImg, enemy.x, enemy.y - 60, 130, 130);
        } else {
            // Obstáculo vira um bloco vermelho se a imagem falhar
            ctx.fillStyle = "#ff3333";
            ctx.fillRect(enemy.x, enemy.y - 60, 130, 130);
        }
    });
}

function drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Velocidade: " + Math.floor(speed), 20, 80);
    ctx.fillText("Tempo: " + Math.floor(frame / 60) + "s", 20, 120);
}

function drawGameOver() {
    if (!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const panelWidth = 650;
    const panelHeight = 350;
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;

    ctx.fillStyle = "#2d1b0f";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.textAlign = "center";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ff4d4d";
    ctx.font = "48px 'Press Start 2P'";
    ctx.fillText("GAME OVER", canvas.width / 2, panelY + 90);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Pontuação: " + score, canvas.width / 2, panelY + 170);
    ctx.fillText("Tempo: " + Math.floor(frame / 60) + "s", canvas.width / 2, panelY + 220);

    ctx.fillStyle = "#d4af37";
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText("Pressione R para jogar novamente", canvas.width / 2, panelY + 300);
    ctx.textAlign = "left";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawEnemies();
    drawHUD();
    drawGameOver();
}

// =====================
// CONTROLES & REINÍCIO
// =====================
function reset() {
    gameOver = false;
    score = 0;
    frame = 0;
    speed = 6;
    enemies = [];
    player.y = cachedGroundY;
    player.vy = 0;
}

window.addEventListener("keydown", e => {
    if ((e.code === "Space" || e.code === "ArrowUp") && player.grounded && !gameOver) {
        player.vy = player.jumpForce;
        player.grounded = false;
    }
    if (e.code === "KeyR" && gameOver) {
        reset();
    }
});

// =====================
// LOOP PRINCIPAL (DISPARO IMEDIATO)
// =====================
let lastTime = performance.now();

function loop(currentTime) {
    let deltaTime = currentTime - lastTime;
    if (deltaTime > 100) deltaTime = TIME_STEP; 

    lastTime = currentTime;

    update(deltaTime);
    draw();
    
    requestAnimationFrame(loop);
}

// Força o início do jogo sem travas de carregamento externo
requestAnimationFrame(loop);
