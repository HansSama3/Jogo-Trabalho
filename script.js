const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);

// =====================
// IMAGENS
// =====================

const background = new Image();
background.src = "background.png";

const playerImg = new Image();
playerImg.src = "archer.png";

// =====================
// FUNDO
// =====================

let bgX = 0;

// =====================
// JOGO
// =====================

let gameOver = false;
let score = 0;
let frame = 0;
let speed = 6;

const GROUND_OFFSET = 89;

// =====================
// PLAYER
// =====================

const player = {

    x: 150,

    y: 0,

    w: 120,
    h: 120,

    vy: 0,

    gravity: 0.8,

    jumpForce: -16,

    grounded: true

};

function getGroundY() {

    return (
        canvas.height
        - player.h
        - GROUND_OFFSET
    );

}

player.y = getGroundY();

// =====================
// INIMIGOS
// =====================

const enemies = [];

function spawnEnemy() {

    enemies.push({
        x: canvas.width,
        y: getGroundY() + player.h - 70,
        w: 130,
        h: 130
    });

}

// =====================
// UPDATE
// =====================

function update() {

    if (gameOver)
        return;

    frame++;

    speed =
        6 +
        Math.floor(frame / 300);

    // PLAYER

    player.vy += player.gravity;

    player.y += player.vy;

    const groundY =
        getGroundY();

    if (
        player.y >= groundY
    ) {

        player.y =
            groundY;

        player.vy = 0;

        player.grounded =
            true;

    }

    // ENEMIES

    // ENEMIES

    enemies.forEach((enemy, index) => {

    enemy.x -= speed;

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

        enemies.splice(index, 1);
        score++;

    }

});

    const spawnRate =
        Math.max(
            90 -
            Math.floor(
                frame / 120
            ),
            35
        );

    if (
        frame %
        spawnRate ===
        0
    ) {

        spawnEnemy();

    }

}

// =====================
// FUNDO LOOP
// =====================

function drawBackground() {

    bgX -= speed * 0.3;

    if (
        bgX <=
        -canvas.width
    ) {

        bgX = 0;

    }

    ctx.drawImage(

        background,

        bgX,

        0,

        canvas.width,

        canvas.height

    );

    ctx.drawImage(

        background,

        bgX +
        canvas.width,

        0,

        canvas.width,

        canvas.height

    );

}

// =====================
// PLAYER
// =====================

function drawPlayer() {

    ctx.drawImage(

        playerImg,

        player.x,

        player.y,

        player.w,

        player.h

    );

}

// =====================
// ENEMIES
// =====================

const obstacleImg = new Image();
obstacleImg.src = "obstacle.png";

function drawEnemies() {

    enemies.forEach(enemy => {

        ctx.drawImage(
        obstacleImg,
        enemy.x,
        enemy.y - 60,
        130,
        130
);

    });

}

// =====================
// HUD
// =====================

function drawHUD() {

    ctx.fillStyle =
        "white";

    ctx.font =
        "20px 'Press Start 2P'";

    ctx.fillText(
        "Score: " +
        score,
        20,
        40
    );

    ctx.fillText(
        "Velocidade: " +
        speed,
        20,
        80
    );

    ctx.fillText(
        "Tempo: " +
        Math.floor(
            frame / 60
        ) +
        "s",
        20,
        120
    );

}

// =====================
// GAME OVER
// =====================

function drawGameOver() {

    if (!gameOver) return;

    // Fundo escuro
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const panelWidth = 650;
    const panelHeight = 350;

    const panelX =
        (canvas.width - panelWidth) / 2;

    const panelY =
        (canvas.height - panelHeight) / 2;

    // Painel
    ctx.fillStyle = "#2d1b0f";
    ctx.fillRect(
        panelX,
        panelY,
        panelWidth,
        panelHeight
    );

    // Borda dourada
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;

    ctx.strokeRect(
        panelX,
        panelY,
        panelWidth,
        panelHeight
    );

    // Título
    ctx.textAlign = "center";

    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 25;

    ctx.fillStyle = "#ff4d4d";

    ctx.font = "48px 'Press Start 2P'";;

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        panelY + 90
    );

    // Remove brilho
    ctx.shadowBlur = 0;

    // Score
    ctx.fillStyle = "#ffffff";

    ctx.font = "20px 'Press Start 2P'";;

    ctx.fillText(
        "Pontuação: " + score,
        canvas.width / 2,
        panelY + 170
    );

    // Tempo
    ctx.fillText(
        "Tempo: " +
        Math.floor(frame / 60) +
        "s",
        canvas.width / 2,
        panelY + 220
    );

    // Reiniciar
    ctx.fillStyle = "#d4af37";

    ctx.font = "16px 'Press Start 2P'";

    ctx.fillText(
        "Pressione R para jogar novamente",
        canvas.width / 2,
        panelY + 300
    );

    ctx.textAlign = "left";
}

// =====================
// DRAW
// =====================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    drawPlayer();

    drawEnemies();

    drawHUD();

    drawGameOver();

}

// =====================
// RESET
// =====================

function reset() {

    gameOver =
        false;

    score = 0;

    frame = 0;

    speed = 6;

    enemies.length =
        0;

    player.y =
        getGroundY();

    player.vy = 0;

}

// =====================
// LOOP
// =====================

function loop() {

    update();

    draw();

    requestAnimationFrame(
        loop
    );

}

// =====================
// CONTROLES
// =====================

window.addEventListener(
    "keydown",
    e => {

        if (

            (
                e.code ===
                "Space" ||

                e.code ===
                "ArrowUp"

            ) &&

            player.grounded &&

            !gameOver

        ) {

            player.vy =
                player.jumpForce;

            player.grounded =
                false;

        }

        if (

            e.code ===
            "KeyR" &&

            gameOver

        ) {

            reset();

        }

    }
);

// =====================
// START
// =====================

Promise.all([

    new Promise(
        resolve =>
            background.onload =
                resolve
    ),

    new Promise(
        resolve =>
            playerImg.onload =
                resolve
    )

]).then(
    () => {

        loop();

    }
);