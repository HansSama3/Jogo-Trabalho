// Variáveis Globais de Controle e Referência
let canvas, ctx;
let score = 0;
let gameOver = false;
let gameLoopId = null; // Impede duplicação do loop ao reiniciar

// Configuração de Fases, Cores e Parallax Profissional
const stages = [
    { name: "Montanhas da Terra", sky: "#87CEEB", mountains: "#5c4033", ground: "#8B4513", form: "Goku Base", hair: "#000000", aura: "rgba(255,255,255,0.15)" },
    { name: "Invasão Saiyajin", sky: "#e67e22", mountains: "#d35400", ground: "#a04000", form: "Goku Kaioken", hair: "#800000", aura: "rgba(255,0,0,0.5)" },
    { name: "Planeta Namekusei", sky: "#1b4d3e", mountains: "#27ae60", ground: "#1e824c", form: "Super Saiyajin", hair: "#FFD700", aura: "rgba(255, 215, 0, 0.6)" },
    { name: "Reino dos Deuses", sky: "#341f97", mountains: "#5f27cd", ground: "#3d1d75", form: "Saiyajin Deus", hair: "#ff0055", aura: "rgba(255, 0, 85, 0.6)" },
    { name: "Espaço Sombrio", sky: "#0c2461", mountains: "#1e3799", ground: "#0a3d62", form: "Super Saiyajin Blue", hair: "#00d2d3", aura: "rgba(0, 210, 211, 0.6)" },
    { name: "Torneio do Poder", sky: "#0b0c10", mountains: "#1f2833", ground: "#2c3531", form: "Instinto Superior", hair: "#ffffff", aura: "rgba(255, 255, 255, 0.75)" }
];

let currentStageIndex = 0;

// Ajuste na rolagem do Parallax para evitar quebras visuais
let skyScroll = 0;
let mountainScroll = 0;
let groundScroll = 0;

// Sistema de Partículas de Ki do Personagem
const particles = [];

// Objeto do Personagem (Goku)
const goku = {
    x: 80,
    y: 300,
    width: 35,
    height: 55,
    vy: 0,
    gravity: 0.7,
    jumpForce: -13.5,
    isGrounded: false
};

const obstacles = [];
let spawnTimer = 0;

function createKiParticle(x, y) {
    particles.push({
        x: x + Math.random() * 30 - 15,
        y: y + Math.random() * 40 + 10,
        size: Math.random() * 4 + 1,
        vy: -Math.random() * 2 - 1,
        alpha: 1
    });
}

function spawnObstacle() {
    let size = Math.random() * (50 - 20) + 20;
    obstacles.push({
        x: canvas.width,
        y: 360 - size,
        width: 24,
        height: size,
        speed: 6 + (score * 0.25)
    });
}

function resetGame() {
    // Para o loop anterior imediatamente para não duplicar velocidade
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    
    score = 0;
    currentStageIndex = 0;
    gameOver = false;
    obstacles.length = 0;
    particles.length = 0;
    goku.y = 300;
    goku.vy = 0;
    goku.isGrounded = true;
    
    loop();
}

function update() {
    if (gameOver) return;

    // Avança de nível a cada 4 pontos obtidos
    currentStageIndex = Math.min(Math.floor(score / 4), stages.length - 1);
    const speedMultiplier = 1 + (score * 0.04);

    // Correção matemática do Parallax Infinito
    skyScroll -= 0.5 * speedMultiplier;
    if (Math.abs(skyScroll) >= canvas.width) skyScroll = 0;

    mountainScroll -= 1.5 * speedMultiplier;
    if (Math.abs(mountainScroll) >= canvas.width) mountainScroll = 0;

    groundScroll -= 6 * speedMultiplier;
    if (Math.abs(groundScroll) >= canvas.width) groundScroll = 0;

    // Física e Gravidade aplicadas no Goku
    goku.vy += goku.gravity;
    goku.y += goku.vy;

    if (goku.y >= 300) {
        goku.y = 300;
        goku.vy = 0;
        goku.isGrounded = true;
    }

    // Emissão controlada de partículas de Ki
    if (Math.random() < 0.5) {
        createKiParticle(goku.x + goku.width / 2, goku.y);
    }

    // Ciclo de vida das partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].y += particles[i].vy;
        particles[i].alpha -= 0.04;
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }

    // Cronômetro de geração de inimigos
    spawnTimer++;
    if (spawnTimer > Math.random() * (85 - 55) + 55) {
        spawnObstacle();
        spawnTimer = 0;
    }

    // Movimentação dos obstáculos e colisão precisa
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacles[i].speed;

        if (
            goku.x < obstacles[i].x + obstacles[i].width &&
            goku.x + goku.width > obstacles[i].x &&
            goku.y < obstacles[i].y + obstacles[i].height &&
            goku.y + goku.height > obstacles[i].y
        ) {
            gameOver = true;
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
        }
    }
}

function draw() {
    const stage = stages[currentStageIndex];

    // Limpar tela inteira antes do novo quadro
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camada 1: Desenhar o Céu estável
    ctx.fillStyle = stage.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Camada 2: Desenho duplo das Montanhas em Parallax Fluido
    ctx.fillStyle = stage.mountains;
    for (let i = 0; i < 2; i++) {
        let startX = mountainScroll + (i * canvas.width);
        ctx.beginPath();
        ctx.moveTo(startX, 360);
        ctx.lineTo(startX + 100, 220);
        ctx.lineTo(startX + 250, 280);
        ctx.lineTo(startX + 450, 160);
        ctx.lineTo(startX + 600, 290);
        ctx.lineTo(startX + 800, 360);
        ctx.fill();
    }

    // Camada 3: Chão estruturado contínuo
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, 360, canvas.width, 40);
    
    // Linhas de velocidade do chão sem interrupção
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let i = 0; i < canvas.width * 2; i += 80) {
        let lineX = groundScroll + i;
        if (lineX < canvas.width) {
            ctx.fillRect(lineX, 365, 35, 6);
        }
    }

    // Linha superior iluminadora do chão
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(0, 360, canvas.width, 3);

    // Camada 4: Aura luminosa de Energia ao redor do Goku
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = stage.hair === "#ffffff" ? "#bfdbfe" : stage.hair;
    ctx.fillStyle = stage.aura;
    ctx.beginPath();
    ctx.arc(goku.x + goku.width / 2, goku.y + goku.height / 2, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Renderização das Partículas de Ki individuais com opacidade dinâmica
    particles.forEach(p => {
        ctx.fillStyle = `rgba(${hexToRgb(stage.hair)}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Camada 5: Desenho do Uniforme Laranja do Goku
    ctx.fillStyle = stage.form === "Goku Base" ? "#ff5722" : "#ff4500"; 
    ctx.fillRect(goku.x, goku.y, goku.width, goku.height);

    // Desenho Vetorial do Cabelo com mechas pontiagudas
    ctx.fillStyle = stage.hair;
    ctx.beginPath();
    ctx.moveTo(goku.x - 4, goku.y + 4);
    ctx.lineTo(goku.x - 12, goku.y - 12);
    ctx.lineTo(goku.x + goku.width / 2, goku.y - 18);
    ctx.lineTo(goku.x + goku.width + 3, goku.y);
    ctx.closePath();
    ctx.fill();

    // Camada 6: Obstáculos de Energia Vermelha Perigosa
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff0033";
    ctx.fillStyle = "#ff2a2a";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    ctx.restore();

    // Camada 7: Painel Interface HUD Superior Integrada
    ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
    ctx.fillRect(15, 15, 290, 90);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeRect(15, 15, 290, 90);

    ctx.fillStyle = "#FFF";
    ctx.font = "900 13px 'Orbitron', sans-serif";
    ctx.fillText(`PONTOS: ${score}`, 30, 38);
    
    ctx.fillStyle = "#aaa";
    ctx.font = "500 11px 'Orbitron', sans-serif";
    ctx.fillText(`LOCAL: ${stage.name.toUpperCase()}`, 30, 62);
    
    ctx.fillStyle = stage.hair === "#ffffff" ? "#00ffff" : (stage.hair === "#000000" ? "#ffcc00" : stage.hair);
    ctx.font = "900 12px 'Orbitron', sans-serif";
    ctx.fillText(`NÍVEL: ${stage.form.toUpperCase()}`, 30, 85);

    // Tela de Fim de Jogo sobreposta
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff4500";
        ctx.fillStyle = "#ff4500";
        ctx.font = "900 42px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("KI ESGOTADO", canvas.width / 2, canvas.height / 2 - 10);
        ctx.restore();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "500 14px 'Orbitron', sans-serif";
        ctx.fillText("Pressione [ R ] para Concentrar seu Ki e Tentar Novamente", canvas.width / 2, canvas.height / 2 + 35);
        ctx.textAlign = "left";
    }
}

// Função utilitária interna para conversão de cores das partículas
function hexToRgb(hex) {
    if (hex === "#ffffff") return "240, 240, 240";
    if (hex === "#000000") return "255, 140, 0";
    let c = hex.substring(1);
    let rgb = parseInt(c, 16);
    let r = (rgb >> 16) & 255;
    let g = (rgb >> 8) & 255;
    let b = rgb & 255;
    return `${r}, ${g}, ${b}`;
}

function loop() {
    update();
    draw();
    if (!gameOver) {
        gameLoopId = requestAnimationFrame(loop);
    }
}

// Inicialização segura após o carregamento da DOM
window.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    // Captura de Eventos do Teclado mapeado globalmente de forma segura
    window.addEventListener("keydown", (e) => {
        if ((e.code === "Space" || e.code === "ArrowUp") && goku.isGrounded && !gameOver) {
            goku.vy = goku.jumpForce;
            goku.isGrounded = false;
        }
        if (e.code === "KeyR" && gameOver) {
            resetGame();
        }
    });

    // Inicia o primeiro jogo
    resetGame();
});
