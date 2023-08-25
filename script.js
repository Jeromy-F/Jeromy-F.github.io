const mainMenu = document.getElementById('mainMenu');
const startButton = document.getElementById('startButton');
const gameContainer = document.getElementById('gameContainer');
const gun = document.getElementById('gun');
const restartButton = document.getElementById('restartButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreText = document.getElementById('scoreText');
const scoreFinalText = document.getElementById('scoreFinalText');
const waveText = document.getElementById('waveText');
const muteButton = document.getElementById("muteButton");
const backgroundMusic = document.getElementById("backgroundMusic");
const gunShot = document.getElementById("gunShot");
const userNick = document.getElementById("userNick");
const thankYou = document.getElementById("thankYou");
const leaderboardList = document.getElementById("leaderboardList");
const backButton = document.getElementById("backButton");
const altTarget = document.getElementById("altTarget");

//Variables
let bullets = [];
let targets = [];
let canShoot = false;
let waveActive = false;
let failCondition = false;
let isMute = false;
let postWaveOne = false;
let waveCalled = false;
let wave = 0;
let waveSize = 0;
let score = 0;
let scoreMod = 1;
let playerName = '';
//Initial values
const initTargetMin = 10;
const initTargetMax = 15;
const initTargetSpeed = 1;
const initTargetRate = 2000;
//Post wave one values
let targetMin = 0;
let targetMax = 0;
let targetSpeed = 0;
let targetRate = 0;

//Game start logic
startButton.addEventListener('click', () => {
    //Obtain player name
    playerName = userNick.value.trim();

    if (playerName.length >= 2 && playerName.length <= 20) {
        //Hide main menu and display game container, prevent firing initial shot, ensure all values are original
        mainMenu.style.display = 'none';
        bullets = [];
        targets = [];
        canShoot = false;
        waveActive = false;
        failCondition = false;
        postWaveOne = false;
        waveCalled = false;
        waveSize = 0;
        wave = 0;
        score = 0;
        scoreMod = 1;
        targetMin = 0;
        targetMax = 0;
        targetSpeed = 0;
        targetRate = 0;
        waveText.textContent = `Wave: ${wave}`;
        scoreText.textContent = `Score: ${score}`;
        gameContainer.style.display = 'block';

        //Allow wave to start and player to attack after delay
        setTimeout(() => {
            canShoot = true;
            startWave(initTargetMin, initTargetMax, initTargetSpeed, initTargetRate);
        }, 100);
    } else {
        alert('You must enter a name between 2 and 20 characters.');
    }
    
});

//Back to Menu? button logic
restartButton.addEventListener('click', () => {
    userNick.value = '';
    gameOverScreen.style.display = 'none';
    mainMenu.style.display = 'block';
});

//Wave start logic
function startWave(waveMin, waveMax, waveSpeed, waveRate) {
    setTimeout(() => {
        if (!waveActive) {
            wave += 1;
            waveText.textContent = `Wave: ${wave}`;
            waveSize = getRandomNumber(waveMin, waveMax);
            waveActive = true;
            waveCalled = false;
            spawnTarget(waveSpeed);
            waveSize--;
            startWave(waveMin, waveMax, waveSpeed, waveRate);
            return;
        }

        if (waveSize != 0) {
            spawnTarget(waveSpeed);
            waveSize--;
            startWave(waveMin, waveMax, waveSpeed, waveRate);
            return;
        } else {
            waveActive = false;
            if (!postWaveOne) {
                requestAnimationFrame(checkEndWave);
            }
            return;
        }
    }, waveRate);
    return;
}

//Prepare next wave by increasing difficulty
function difficultyIncrease() {
    //Determine if initial values should be used or not
    if (!postWaveOne) {
        postWaveOne = true;
        targetMin = initTargetMin + 2;
        targetMax = initTargetMax + 3;
        targetSpeed = initTargetSpeed + 1;
        targetRate = initTargetRate * 0.8;
        scoreMod += 0.1;
        startWave(targetMin, targetMax, targetSpeed, targetRate);
    } else {
        //If statements to cap difficulty
        if (targetMin < 20) {
            targetMin += 2;
        }
        if (targetMax < 26) {
            targetMax += 2;
        }
        if (targetSpeed < 5) {
            targetSpeed += 0.5;
        }
        if (targetRate > 500) {
            targetRate *= 0.9;
            if (targetRate < 500) {
                targetRate = 500;
            }
        }
        scoreMod += 0.1;
        startWave(targetMin, targetMax, targetSpeed, targetRate);
    }
    return;
}

//Target creation logic
function spawnTarget(speed) {
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.left = '-40px';
    target.style.top = getRandomNumber(0, gameContainer.clientHeight - 40) + 'px'; //Choose random vertical start
    document.body.appendChild(target);
    targets.push(target);
    
    //Target movement logic
    const targetInterval = setInterval(() => {
        target.style.left = parseFloat(target.style.left) + speed + 'px';

        //Trigger game over if target makes it to 80% of screen width
        if (failCondition) {
            document.body.removeChild(target);
            clearInterval(targetInterval);
        } else if (parseFloat(target.style.left) >= gameContainer.clientWidth * 0.8) {
            canShoot = false;
            failCondition = true;
            waveSize = 0;
            document.body.removeChild(target);
            clearInterval(targetInterval);
            targets = [];
            endGame();
        } else {
            //Remove target if contact is made with bullet
            bullets.forEach(bullet => {
                const bulletRect = bullet.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();

                if (bulletRect.right >= targetRect.left &&
                    bulletRect.left <= targetRect.right &&
                    bulletRect.bottom >= targetRect.top &&
                    bulletRect.top <= targetRect.bottom
                ) {
                    //Display broken target
                    altTarget.style.left = targetRect.left + 'px';
                    altTarget.style.top = targetRect.top + 'px';
                    altTarget.style.display = "block";
                    //Remove Target
                    document.body.removeChild(target);
                    clearInterval(targetInterval);
                    //Increase player score
                    score += 10 * scoreMod;
                    scoreText.textContent = `Score: ${score}`;
                    //Hide broken target
                    setTimeout(() => {
                        altTarget.style.display = 'none';
                    }, 20);
                }
            });
        }
    }, 10);
    return;
}

//Check wave logic
function checkEndWave () {
    //Exit
    if (failCondition) {
        return;
    }

    //Call difficultyIncrease when appropriate
    if (!waveActive && !waveCalled && waveSize == 0) {
        difficultyIncrease();
        waveCalled = true;
    }
    //Continue
    requestAnimationFrame(checkEndWave);
}

//End game logic
function endGame() {
    gameContainer.style.display = 'none';
    thankYou.textContent = `Thank you for playing ${playerName}!`;
    scoreFinalText.textContent = `Final Score: ${score}`;
    //Update and display leaderboard
    localStorage.setItem('playerName', playerName);
    updateLeaderboard(playerName, score);
    loadLeaderboard();
    gameOverScreen.style.display = 'flex';
    return;
}

//Load leaderboard logic
function loadLeaderboard() {
    leaderboardList.innerHTML = '';

    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

    leaderboardData.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}

//Update leaderboard logic
function updateLeaderboard() {

    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

    leaderboardData.push({ name: playerName, score: score });
    leaderboardData.sort((a, b) => b.score - a.score);
    if (leaderboardData.length > 10) {
        leaderboardData.pop(); //Remove entries below ten
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    loadLeaderboard();
}

//Function to obtain random value within provided range
function getRandomNumber(min, max) {
    const range = max - min + 1;
    const random = Math.random() * range;
    const result = Math.floor(random) + min;

    return result;
}

//Logic for gun to follow players cursor
document.addEventListener('mousemove', (event) => {
    const mouseY = event.clientY;
    const gunHeight = gun.offsetHeight
    const gunHalfHeight = gunHeight / 2;
    const topPosition = mouseY - gunHalfHeight;
    gun.style.top = topPosition + 'px';
});

//Logic for gun firing
document.addEventListener('click', (event) => {
    //Prevent firing when undesired
    if (!canShoot) {
        return;
    }

    const gunRect = gun.getBoundingClientRect();

    //Bullet creation logic
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = gunRect.left + 50 + 'px';
    bullet.style.top = gunRect.top + (gunRect.height / 8) + 'px';
    document.body.appendChild(bullet);
    bullets.push(bullet);

    //Change texture
    gun.style.backgroundImage = 'url(resources/Asset_7.png)';
    setTimeout(() => {
        gun.style.backgroundImage = 'url(resources/Asset_6.png)';
    }, 100);

    //Play gunshot
    gunShot.currentTime = 0;
    gunShot.play();

    //Bullet movement logic
    const bulletSpeed = 25;
    const bulletInterval = setInterval(() => {
        bullet.style.left = parseFloat(bullet.style.left) - bulletSpeed + 'px';
    
        //Remove bullets if they miss
        if (parseFloat(bullet.style.left) < 0) {
            clearInterval(bulletInterval);
            document.body.removeChild(bullet);
            bullets = bullets.filter(b => b !== bullet);
        } else {
            //Remove bullet if contact is made with target
            targets.forEach(target => {
                const bulletRect = bullet.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();

                if (bulletRect.right >= targetRect.left &&
                    bulletRect.left <= targetRect.right &&
                    bulletRect.bottom >= targetRect.top &&
                    bulletRect.top <= targetRect.bottom
                ) {
                    //Remove bullet
                    setTimeout(() => {
                        document.body.removeChild(bullet);
                        clearInterval(bulletInterval);
                    }, 15);
                }
            });
        }
    }, 10);

    //Limit firerate
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, 250);
});

//Initialize music and sfx
document.addEventListener("DOMContentLoaded", function() {
    backgroundMusic.volume = 0.5;
    gunShot.volume = 0.5;
    backgroundMusic.play();
});

//Mute button logic
muteButton.addEventListener("click", function() {
    if (!isMute) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
    isMute = !isMute;
    muteButton.textContent = isMute ? "Unmute" : "Mute";
});