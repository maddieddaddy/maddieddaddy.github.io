const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'blue',
    speed: 2.5,
    health: 100,
    experience: 0,
    level: 1
};

const enemies = [];
const attacks = [];

const enemyTypes = {
    slow: { color: 'green', speed: 0.5, health: 3, xp: 50 },
    fast: { color: 'red', speed: 1.5, health: 1, xp: 30 }
};

const keys = {
    w: false,
    a: false,
    s: false, 
    d: false
};

const modal = document.getElementById('levelUpModal');
const healthUpgrade = document.getElementById('healthUpgrade');
const speedUpgrade = document.getElementById('speedUpgrade');
const damageUpgrade = document.getElementById('damageUpgrade');

let gameRunning = true;
let attackCooldown = 0;
let modalOpen = false;

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key === ' ') shoot(); 
    if (e.key.toLowerCase() === 'm') openShop(); 
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function movePlayer() {
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;
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

function createEnemy() {
    const type = Math.random() < 0.5 ? 'slow' : 'fast';
    const enemyConfig = enemyTypes[type];

    const spawnSide = Math.floor(Math.random() * 4);
    let x, y;

    switch (spawnSide) {
        case 0:
            x = Math.random() * canvas.width;
            y = -20;
            break;
        case 1:
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
        case 2: 
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
        case 3: 
            x = -20;
            y = Math.random() * canvas.height;
            break;
    }

    enemies.push({
        x: x,
        y: y,
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

function findClosestEnemy() {
    if (enemies.length === 0) return null;

    let closestEnemy = null;
    let closestDistance = Infinity;

    enemies.forEach((enemy) => {
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    });
    return closestEnemy;
}

function shoot() {
    const target = findClosestEnemy();

    if (target) {
        const dx = target.x - (player.x + player.size / 2);
        const dy = target.y - (player.y + player.size / 2);
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        attacks.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            dx: dx / magnitude, 
            dy: dy / magnitude,
            size: 5,
            color: 'orange',
            speed: 2.5
        });
    }
}

function updateAttacks() {
    attacks.forEach((attack, index) => {
        attack.x += attack.dx * attack.speed;
        attack.y += attack.dy * attack.speed;

        if (attack.x < 0 ||
            attack.x > canvas.width ||
            attack.y < 0 ||
            attack.y > canvas.height
        ) {
            attacks.splice(index, 1);
        }

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
        `Магазин!\n1. Здоровье (+20 HP) - 50 XP\n2. Скорость (+1) - 50 XP\n3. Урон (+1) - 50 XP\nВаш опыт: ${player.experience}`
    );
    switch (choice) {
        case '1':
            if (player.experience >= 50) {
                player.experience -= 50;
                player.health = Math.min(100, player.health + 20);
                alert('Здоровье увеличено!');
            } else {
                alert('Недостаточно опыта!')
            }
            break;
        case '2':
            if (player.experience >= 50) {
                player.experience -= 50;
                player.speed++;
                alert('Скорость увеличена!');
            } else {
                alert('Недостаточно опыта!')
            }
            break;
        case '3':
            if (player.experience >= 50) {
                player.experience -= 50;
                attacks.forEach(attack => (attack.damage = (attack.damage || 1) + 1));
                alert('Урон увеличен!');
            } else {
                alert('Недостаточно опыта!')
            }
            break;
        default:
            alert('Выход из магазина.');
    }
}

function openLevelUpModal() {
    modal.style.display = 'flex';
    modalOpen = true;
    gameRunning = false;
}

function closeLevelUpModal() {
    modal.style.display = 'none';
    modalOpen = false;
    gameRunning = true;
    gameLoop();
}

function chooseUpgrade(option) {
    switch (option) {
        case 1:
            player.health = Math.min(100, player.health + 20);
            break;
        case 2:
            player.speed++;
            break;
        case 3:
            attacks.forEach(attack => (attack.damage = (attack.damage || 1) + 1));
            break;
    }
    closeLevelUpModal();
}

function checkLevelUp() {
    const xpForNextLevel = player.level * 100;
    if (player.experience >= xpForNextLevel) {
        player.level++;
        player.experience -= xpForNextLevel;
        openLevelUpModal();
    }
}

document.addEventListener('keydown', (event) => {
    if (modalOpen) {
        if (event.key === '1') {
            chooseUpgrade(1);
        } else if (event.key === '2') {
            chooseUpgrade(2);
        } else if (event.key === '3') {
            chooseUpgrade(3);
        } else if (event.key === ' ') {
            closeLevelUpModal();
        }
        return;
    }

    if (keys.hasOwnProperty(event.key.toLowerCase())) {
        keys[event.key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key.toLowerCase())) {
        keys[event.key.toLowerCase()] = false;
    }
});

function endGame() {
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Игра окончена', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Ваш уровень: ${player.level}`, canvas.width / 2, canvas.height / 2 + 40);
}

function gameLoop() {

    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    drawPlayer();
    moveEnemies();
    drawEnemies();
    updateAttacks();
    checkCollisions();

    if (attackCooldown <= 0) {
        shoot();
        attackCooldown = 20;
    } else {
        attackCooldown--;
    }
    
    if (Math.random() < 0.02) createEnemy();

    if (player.health <= 0) {
        endGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
