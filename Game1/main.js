const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'blue',
    speed: 5
};

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
});

function updatePlayerPosition() {
    if (keys.w) player.y -= player.speed; 
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed; 
    if (keys.d) player.x += player.speed; 

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

const enemies = [];

function createEnemy() {
    const size = Math.random() * 30 + 10; 
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        color: 'red',
        speed: Math.random() * 2 + 1
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x; 
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy); 

        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
    });
}

player.health = 100;

function drawPlayerHealth() {
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, player.health * 2, 20); 
    ctx.strokeStyle = 'black';
    ctx.strokeRect(10, 10, 200, 20); 
}

const attacks = [];

function createAttack(x, y) {
    attacks.push({
        x: x,
        y: y,
        size: 10,
        speed: 7,
        color: 'yellow'
    });
}

function drawAttacks() {
    attacks.forEach(attack => {
        ctx.fillStyle = attack.color;
        ctx.fillRect(attack.x, attack.y, attack.size, attack.size);
    });
}

function updateAttacks() {
    attacks.forEach((attack, index) => {
        attack.y -= attack.speed; 

        if (attack.y < 0) {
            attacks.splice(index, 1);
        }
    });
}

function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size + enemy.size) {
            player.health -= 10; 
            enemies.splice(enemyIndex, 1); 
        }
    });

    attacks.forEach((attack, attackIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                attack.x < enemy.x + enemy.size &&
                attack.x + attack.size > enemy.x &&
                attack.y < enemy.y + enemy.size &&
                attack.y + attack.size > enemy.y
            ) {
                attacks.splice(attackIndex, 1);
                enemies.splice(enemyIndex, 1);
            }
        });
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    updatePlayerPosition(); 
    updateEnemies(); 
    updateAttacks(); 
    checkCollisions(); 
    drawPlayer(); 
    drawPlayerHealth(); 
    drawEnemies(); 
    drawAttacks(); 

    if (player.health > 0) {
        requestAnimationFrame(gameLoop); 
    } else {
        alert('Игра окончена!');
        location.reload(); 
    }
}

setInterval(createEnemy, 2000);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        createAttack(player.x + player.size / 2 - 5, player.y);
    }
});

gameLoop();
