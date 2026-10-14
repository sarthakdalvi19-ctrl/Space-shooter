
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const description = document.getElementById("description");
const startButton = document.getElementById("startButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let player;
let bullets = [];
let enemies = [];
let stars = [];
let keys = {};

let score = 0;
let lives = 3;
let level = 1;

let running = false;
let paused = false;
let lastShot = 0;
let lastSpawn = 0;
let previousTime = 0;

function createStars() {
    stars = [];

    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: 20 + Math.random() * 65
        });
    }
}

function resetGame() {
    player = {
        x: WIDTH / 2 - 18,
        y: HEIGHT - 65,
        width: 36,
        height: 38,
        speed: 320
    };

    bullets = [];
    enemies = [];
    score = 0;
    lives = 3;
    level = 1;
    lastShot = 0;
    lastSpawn = 0;
    paused = false;
    running = true;

    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;

    createStars();
    overlay.style.display = "none";
}

function drawBackground(dt) {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const star of stars) {
        star.y += star.speed * dt;

        if (star.y > HEIGHT) {
            star.y = 0;
            star.x = Math.random() * WIDTH;
        }

        ctx.fillStyle = "#dbeafe";
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    ctx.globalAlpha = 1;
}

function drawPlayer() {
    ctx.save();
    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    // Engine flames
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(-9, 12);
    ctx.lineTo(-4, 26 + Math.random() * 5);
    ctx.lineTo(0, 13);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2, 13);
    ctx.lineTo(7, 27 + Math.random() * 5);
    ctx.lineTo(10, 12);
    ctx.fill();

    // Spaceship body
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(0, -21);
    ctx.lineTo(18, 16);
    ctx.lineTo(5, 11);
    ctx.lineTo(0, 15);
    ctx.lineTo(-5, 11);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#eff6ff";
    ctx.beginPath();
    ctx.ellipse(0, -3, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBullets() {
    for (const bullet of bullets) {
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 12;
        ctx.fillRect(
            bullet.x, bullet.y, bullet.width, bullet.height
        );
    }

    ctx.shadowBlur = 0;
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.save();
        ctx.translate(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );

        ctx.shadowColor = "#fb7185";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#fb7185";

        ctx.beginPath();
        ctx.moveTo(-15, -5);
        ctx.lineTo(-10, -15);
        ctx.lineTo(-3, -10);
        ctx.lineTo(3, -10);
        ctx.lineTo(10, -15);
        ctx.lineTo(15, -5);
        ctx.lineTo(12, 12);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-8, -4, 4, 4);
        ctx.fillRect(4, -4, 4, 4);

        ctx.restore();
    }
}

function shoot(now) {
    if (keys.Space && now - lastShot >= 220) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y - 8,
            width: 4,
            height: 14,
            speed: 500
        });

        lastShot = now;
    }
}

function spawnEnemies(now) {
    const interval = Math.max(350, 1000 - (level - 1) * 70);

    if (now - lastSpawn >= interval) {
        const size = 30;

        enemies.push({
            x: Math.random() * (WIDTH - size),
            y: -size,
            width: size,
            height: size,
            speed: 90 + (level - 1) * 15
        });

        lastSpawn = now;
    }
}

function collides(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function update(dt, now) {
    if (keys.ArrowLeft || keys.KeyA) {
        player.x -= player.speed * dt;
    }

    if (keys.ArrowRight || keys.KeyD) {
        player.x += player.speed * dt;
    }

    player.x = Math.max(
        0,
        Math.min(WIDTH - player.width, player.x)
    );

    shoot(now);
    spawnEnemies(now);

    for (const bullet of bullets) {
        bullet.y -= bullet.speed * dt;
    }

    bullets = bullets.filter(
        bullet => bullet.y + bullet.height > 0
    );

    for (const enemy of enemies) {
        enemy.y += enemy.speed * dt;
    }

    // Bullet versus enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        let destroyed = false;

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (collides(bullets[j], enemy)) {
                bullets.splice(j, 1);
                enemies.splice(i, 1);

                score += 10;
                scoreElement.textContent = score;

                level = Math.floor(score / 100) + 1;
                levelElement.textContent = level;

                destroyed = true;
                break;
            }
        }

        if (destroyed) continue;

        // Enemy reaches the bottom or hits the player
        if (
            collides(enemy, player) ||
            enemy.y + enemy.height >= HEIGHT
        ) {
            enemies.splice(i, 1);
            lives--;
            livesElement.textContent = lives;

            if (lives <= 0) {
                endGame();
                return;
            }
        }
    }
}

function endGame() {
    running = false;
    paused = false;

    message.textContent = "GAME OVER";
    description.textContent = `Your final score is ${score}. Try again!`;
    startButton.textContent = "PLAY AGAIN";
    overlay.style.display = "flex";
}

function drawPausedScreen() {
    ctx.fillStyle = "#020617cc";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#67e8f9";
    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
}

function draw(dt) {
    drawBackground(dt);

    if (player) drawPlayer();

    drawBullets();
    drawEnemies();

    if (paused) drawPausedScreen();
}

function gameLoop(now) {
    const dt = Math.min((now - previousTime) / 1000 || 0, 0.04);
    previousTime = now;

    if (running && !paused) {
        update(dt, now);
    }

    draw(running && !paused ? dt : 0);
    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", resetGame);

document.addEventListener("keydown", event => {
    if (
        ["ArrowLeft", "ArrowRight", "Space"].includes(event.code)
    ) {
        event.preventDefault();
    }

    keys[event.code] = true;

    if (event.code === "KeyP" && running) {
        paused = !paused;
    }
});

document.addEventListener("keyup", event => {
    keys[event.code] = false;
});

createStars();

player = {
    x: WIDTH / 2 - 18,
    y: HEIGHT - 65,
    width: 36,
    height: 38,
    speed: 320
};

requestAnimationFrame(gameLoop);
