const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

let coins = 0;
let swordLevel = 1;
let armorLevel = 1;
const baseHealth = 100;

let hero = {
    x: width / 2,
    y: height / 2,
    maxHealth: baseHealth,
    health: baseHealth
};

let enemies = [];
let enemyTimer = 0;
let backgroundOffset = 0;
let gameState = 'running';

function heroDamage() {
    return 10 + swordLevel * 5;
}

function armorDefense() {
    return armorLevel * 5;
}

function spawnEnemy() {
    const size = 20;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) {
        x = Math.random() * width;
        y = -size;
    } else if (edge === 1) {
        x = width + size;
        y = Math.random() * height;
    } else if (edge === 2) {
        x = Math.random() * width;
        y = height + size;
    } else {
        x = -size;
        y = Math.random() * height;
    }
    const enemy = {
        x,
        y,
        size,
        health: 20 + Math.random() * 30,
        attack: 10 + Math.random() * 10,
        coin: 5,
        speed: 1 + Math.random()
    };
    enemies.push(enemy);
}

function update() {
    if (gameState !== 'running') return;

    backgroundOffset += 2;

    enemyTimer--;
    if (enemyTimer <= 0) {
        spawnEnemy();
        enemyTimer = 60; // roughly one enemy per second
    }

    enemies.forEach(enemy => {
        const dx = hero.x - enemy.x;
        const dy = hero.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = hero.x - enemy.x;
        const dy = hero.y - enemy.y;
        if (Math.hypot(dx, dy) < enemy.size) {
            if (heroDamage() >= enemy.health) {
                coins += enemy.coin;
            } else {
                const dmg = Math.max(1, enemy.attack - armorDefense());
                hero.health -= dmg;
                coins += enemy.coin;
                if (hero.health <= 0) {
                    openMenu();
                }
            }
            enemies.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#5ec27f';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#4caf50';
    for (let y = -40; y < height + 40; y += 40) {
        const off = (y + backgroundOffset) % 40;
        ctx.fillRect(0, off, width, 5);
    }
}

function drawHero() {
    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(hero.x - 15, hero.y - 15, 30, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hero.x + 15, hero.y);
    ctx.lineTo(hero.x + 30, hero.y);
    ctx.stroke();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#e53935';
        ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    });
}

function drawUI() {
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`HP: ${Math.max(0, Math.floor(hero.health))}`, 10, 20);
    ctx.fillText(`Moedas: ${coins}`, 10, 40);
}

function loop() {
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawHero();
    drawEnemies();
    drawUI();
    update();
    requestAnimationFrame(loop);
}

function openMenu() {
    gameState = 'upgrade';
    document.getElementById('upgradeMenu').classList.remove('hidden');
    updateMenuText();
}

function closeMenu() {
    document.getElementById('upgradeMenu').classList.add('hidden');
    gameState = 'running';
}

function updateMenuText() {
    document.getElementById('coinDisplay').textContent = `Moedas: ${coins}`;
    document.getElementById('upgradeSword').textContent = `Melhorar Espada (Nível ${swordLevel}) - Custo ${swordLevel * 20}`;
    document.getElementById('upgradeArmor').textContent = `Melhorar Colete (Nível ${armorLevel}) - Custo ${armorLevel * 20}`;
}

document.getElementById('upgradeSword').addEventListener('click', () => {
    const cost = swordLevel * 20;
    if (coins >= cost) {
        coins -= cost;
        swordLevel++;
        updateMenuText();
    }
});

document.getElementById('upgradeArmor').addEventListener('click', () => {
    const cost = armorLevel * 20;
    if (coins >= cost) {
        coins -= cost;
        armorLevel++;
        updateMenuText();
    }
});

document.getElementById('startRun').addEventListener('click', () => {
    hero.maxHealth = baseHealth + armorLevel * 20;
    hero.health = hero.maxHealth;
    enemies = [];
    closeMenu();
});

updateMenuText();
loop();
