const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverMessage = document.getElementById('gameOverMessage');
const topScoreDisplay = document.getElementById('topScore');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const airplaneImage = new Image();
const buildingImage = new Image();
airplaneImage.src = 'airplane.png'; // Ensure this image is in the same directory as your HTML file
buildingImage.src = 'building.png'; // Ensure this image is in the same directory as your HTML file

const explosionImages = [];
for (let i = 1; i <= 5; i++) { // Assume we have 5 explosion images
    const img = new Image();
    img.src = `explosion${i}.png`; // Ensure these images are in the same directory as your HTML file
    explosionImages.push(img);
}

const explosionSound = new Audio('explosion.mp3'); // Ensure this sound file is in the same directory as your HTML file
const backgroundMusic = new Audio('background_music.mp3'); // Replace with your background music file

const airplaneWidth = 50;
const airplaneHeight = 30;
const buildingWidth = 50;
const groundHeight = 20;

const airplane = {
    x: 50,
    y: canvasHeight - groundHeight - airplaneHeight,
    width: airplaneWidth,
    height: airplaneHeight,
    vy: 0,
    gravity: 1.5,
    jumpStrength: -15
};

let buildings = [];
let isGameOver = false;
let score = 0;
let topScore = getTopScoreFromCookies(); // Initialize top score from cookies
let frameCount = 0;
let explosionFrame = 0;

// Play background music
backgroundMusic.loop = true; // Loop the background music
backgroundMusic.volume = 0.5; // Adjust the volume (0.0 to 1.0)
backgroundMusic.play();

function drawAirplane() {
    ctx.drawImage(airplaneImage, airplane.x, airplane.y, airplane.width, airplane.height);
}

function drawBuilding(building) {
    ctx.drawImage(buildingImage, building.x, building.y, building.width, building.height);
}

function drawBuildings() {
    buildings.forEach(building => drawBuilding(building));
}

function drawGround() {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function drawTopScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Top Score: ' + topScore, 10, 40); // Adjust position as needed
}

function drawExplosion() {
    if (explosionFrame === 0) {
        explosionSound.play(); // Play the explosion sound at the start of the explosion
        backgroundMusic.pause(); // Pause background music
    }

    if (explosionFrame < explosionImages.length) {
        ctx.drawImage(explosionImages[explosionFrame], airplane.x, airplane.y, airplane.width, airplane.height);
        explosionFrame++;
        setTimeout(drawExplosion, 100); // Adjust the speed of the explosion
    } else {
        gameOver();
    }
}

function update() {
    if (isGameOver) {
        drawExplosion();
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    airplane.vy += airplane.gravity;
    airplane.y += airplane.vy;

    if (airplane.y + airplane.height >= canvasHeight - groundHeight) {
        airplane.y = canvasHeight - groundHeight - airplane.height;
        airplane.vy = 0;
    }

    if (frameCount % 90 === 0) {
        const buildingHeight = Math.floor(Math.random() * (canvasHeight - groundHeight - 100)) + 50;
        buildings.push({
            x: canvasWidth,
            y: canvasHeight - groundHeight - buildingHeight,
            width: buildingWidth,
            height: buildingHeight
        });
    }

    buildings.forEach(building => building.x -= 5);
    buildings = buildings.filter(building => building.x + building.width > 0);

    buildings.forEach(building => {
        if (
            airplane.x < building.x + building.width &&
            airplane.x + airplane.width > building.x &&
            airplane.y < building.y + building.height &&
            airplane.y + airplane.height > building.y
        ) {
            gameOver();
        }
    });

    if (!isGameOver) score += 1;

    drawAirplane();
    drawBuildings();
    drawGround();
    drawScore();
    drawTopScore();

    frameCount++;
    requestAnimationFrame(update);
}

function gameOver() {
    isGameOver = true;
    gameOverMessage.classList.add('active');
    updateTopScore();
    saveTopScoreToCookies();
    topScoreDisplay.textContent = 'Top Score: ' + topScore;
}

function updateTopScore() {
    if (score > topScore) {
        topScore = score;
    }
}

function saveTopScoreToCookies() {
    document.cookie = `topScore=${topScore};expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

function getTopScoreFromCookies() {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'topScore') {
            return parseInt(value) || 0;
        }
    }
    return 0;
}

canvas.addEventListener('keydown', event => {
    if (event.code === 'Space' && !isGameOver) {
        airplane.vy = airplane.jumpStrength;
    }
    if (isGameOver && event.code === 'Space') {
        resetGame();
    }
});

canvas.addEventListener('touchstart', event => {
    if (!isGameOver) {
        airplane.vy = airplane.jumpStrength;
    }
    if (isGameOver) {
        resetGame();
    }
});

window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    airplane.y = canvasHeight - groundHeight - airplane.height;
    buildings = [];
});

canvas.setAttribute('tabindex', '0');
canvas.focus();

function resetGame() {
    airplane.y = canvasHeight - groundHeight - airplane.height;
    airplane.vy = 0;
    buildings = [];
    isGameOver = false;
    score = 0;
    frameCount = 0;
    explosionFrame = 0;
    gameOverMessage.classList.remove('active');
    backgroundMusic.currentTime = 0; // Reset background music to start
    backgroundMusic.play(); // Resume background music
    update();
}

update();
