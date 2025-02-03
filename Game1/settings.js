const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'blue',
    speed: 5,
    health: 100,
    experience: 0,
    level: 1
};

const enemies = [];
const attacks = [];

const enemyTypes = {
    slow: { color: 'green', speed: 1, health: 3, xp: 50 },
    fast: { color: 'red', speed: 3, health: 1, xp: 30 }
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key === ' ') shoot(); 
    if (e.key.toLowerCase() === 'm') openShop(); 
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function movePlayer() {
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.size) player.x += player.speed;
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`HP: ${player.health}`, 10, 20);
    ctx.fillText(`Level: ${player.level}`, 10, 40);
    ctx.fillText(`XP: ${player.experience}`, 10, 60);
}

function checkLevelUp() {
    const xpForNextLevel = player.level * 100;
    if (player.experience >= xpForNextLevel) {
        player.level++;
        player.experience -= xpForNextLevel;
        player.health = Math.min(100, player.health + 20);
        alert(`Вы достигли уровня ${player.level}!`);
    }
}

function createEnemy() {
    const type = Math.random() < 0.5 ? 'slow' : 'fast';
    const enemyConfig = enemyTypes[type];
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        color: enemyConfig.color,
        speed: enemyConfig.speed,
        health: enemyConfig.health,
        xp: enemyConfig.xp
    });
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

function moveEnemies() {
    enemies.forEach((enemy) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
    });
}

function shoot() {
    attacks.push({
        x: player.x + player.size / 2,
        y: player.y,
        size: 5,
        color: 'orange',
        speed: 7
    });
}

function updateAttacks() {
    attacks.forEach((attack, index) => {
        attack.y -= attack.speed;
        if (attack.y < 0) attacks.splice(index, 1);
        ctx.fillStyle = attack.color;
        ctx.fillRect(attack.x, attack.y, attack.size, attack.size);
    });
}

function checkCollisions() {
    attacks.forEach((attack, attackIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                attack.x < enemy.x + enemy.size &&
                attack.x + attack.size > enemy.x &&
                attack.y < enemy.y + enemy.size &&
                attack.y + attack.size > enemy.y
            ) {
                enemy.health--;
                attacks.splice(attackIndex, 1);

                if (enemy.health <= 0) {
                    player.experience += enemy.xp;
                    enemies.splice(enemyIndex, 1);
                }
            }
        });
    });

    enemies.forEach((enemy, enemyIndex) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size + enemy.size) {
            player.health -= 10;
            enemies.splice(enemyIndex, 1);
        }
    });

    checkLevelUp();
}

function openShop() {
    const choice = prompt(
        `Магазин:\n1. Здоровье (+20 HP) - 50 XP\n2. Скорость (+1) - 50 XP\n3. Урон (+1) - 50 XP\nВаш опыт: ${player.experience}`
    );
    switch (choice) {
        case '1':
            if (player.experience >= 50) {
                player.experience -= 50;
                player.health = Math.min(100, player.health + 20);
                alert('Здоровье восстановлено!');
            } else {
                alert('Недостаточно опыта!');
            }
            break;
        case '2':
            if (player.experience >= 50) {
                player.experience -= 50;
                player.speed++;
                alert('Скорость увеличена!');
            } else {
                alert('Недостаточно опыта!');
            }
            break;
        default:
            alert('Выход из магазина.');
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    drawPlayer();
    moveEnemies();
    drawEnemies();
    updateAttacks();
    checkCollisions();

    if (Math.random() < 0.02) createEnemy();

    requestAnimationFrame(gameLoop);
}

gameLoop();
