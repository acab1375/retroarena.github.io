const selectAttackSection = document.getElementById('select-attack')
const restartGameSection = document.getElementById('restart-button')
const playerChampionButton = document.getElementById('champion-button')
const restartButton = document.getElementById('restart-button')
restartGameSection.style.display = 'none'

const selectChampionSection = document.getElementById('select-champion')
const playerChampionSpan = document.getElementById('player-champion')

const enemyChampionSpan = document.getElementById('enemy-champion')

const playerLifeSpan = document.getElementById('player-life')
const enemyLifeSpan = document.getElementById('enemy-life')

const messagesSection = document.getElementById('score')
const playerAttacks = document.getElementById('player-attacks')
const enemyAttacks = document.getElementById('enemy-attacks')
const cardsContainer = document.getElementById('cardsContainer')
const attacksContainer = document.getElementById('attacksContainer')

const seeMapSection = document.getElementById('see-map')
const map = document.getElementById('map')

let playerId = null
let enemyId = null
let champions = []
let enemiesChampions = []
let playerAttack = []
let enemyAttack = []
let championsOption
let inputWarrior
let inputMage
let inputRogue
let playerChampion
let playerChampionObject
let championAttacks
let enemyChampionAttacks
let fireButton
let waterButton
let earthButton
let buttons = []
let indexPlayerAttack
let indexEnemyAttack
let playerWins = 0
let enemyWins = 0
let playerLifes = 3
let enemyLifes = 3
let canvas = map.getContext("2d")
let interval
let mapBackground = new Image()
mapBackground.src = './assets/map-lava.jpg'
let heightWeNeed
let mapWidth = window.innerWidth - 20
const maxMapWidth = 600

if (mapWidth > maxMapWidth) {
    mapWidth = maxMapWidth - 20
}

heightWeNeed = mapWidth * 550 / 550

map.width = mapWidth
map.height = heightWeNeed

class Champion {
    constructor(name, photo, life, photoMap, id = null) {
        this.id = id
        this.name = name
        this.photo = photo
        this.life = life
        this.attacks = []
        this.width = 100
        this.height = 100
        this.x = random(0, map.width - this.width)
        this.y = random(0, map.height - this.height)
        this.mapPhoto = new Image()
        this.mapPhoto.src = photoMap
        this.speedX = 0
        this.speedY = 0
    }

    paintChampion() {
        canvas.drawImage(
            this.mapPhoto,
            this.x,
            this.y,
            this.width,
            this.height,
        )
    }
}

let warrior = new Champion('Warrior', './assets/warrior1.gif', 5, './assets/warrior1.gif')

let mage = new Champion('Mage', './assets/mage1.gif', 5, 'assets/mage1.gif')

let rogue = new Champion('Rogue', './assets/rogue1.gif', 5, './assets/rogue1.gif')

const WARRIOR_ATTACKS = [
    { name: '💧', id: 'water-button' },
    { name: '💧', id: 'water-button' },
    { name: '💧', id: 'water-button' },
    { name: '🔥', id: 'fire-button' },
    { name: '🌱', id: 'earth-button' },
]

warrior.attacks.push(...WARRIOR_ATTACKS)

const MAGE_ATTACKS = [
    { name: '🌱', id: 'earth-button' },
    { name: '🌱', id: 'earth-button' },
    { name: '🌱', id: 'earth-button' },
    { name: '💧', id: 'water-button' },
    { name: '🔥', id: 'fire-button' },
]

mage.attacks.push(...MAGE_ATTACKS)

const ROGUE_ATTACKS = [
    { name: '🔥', id: 'fire-button' },
    { name: '🔥', id: 'fire-button' },
    { name: '🔥', id: 'fire-button' },
    { name: '💧', id: 'water-button' },
    { name: '🌱', id: 'earth-button' },
]

rogue.attacks.push(...ROGUE_ATTACKS)

champions.push(warrior, mage, rogue)

function startGame() {

    selectAttackSection.style.display = 'none'
    seeMapSection.style.display = 'none'

    champions.forEach((champion) => {
        championsOption = `
        <input type="radio" name="champion" id=${champion.name} />
        <label class="champion-cards" for=${champion.name}>
            <p>${champion.name}</p>
            <img src=${champion.photo} alt=${champion.name}>
        </label>
        `
        cardsContainer.innerHTML += championsOption

        inputWarrior = document.getElementById('Warrior')
        inputMage = document.getElementById('Mage')
        inputRogue = document.getElementById('Rogue')

    })

    playerChampionButton.addEventListener('click', selectPlayerChampion)

    restartButton.addEventListener('click', restartGame)

    joinGame()
}

function joinGame() {
    fetch("http://192.168.1.2:8080/join")
        .then(function (res) {
            if (res.ok) {
                res.text()
                    .then(function (answer) {
                        console.log(answer)
                        playerId = answer
                    })
            }
        })
}

function selectPlayerChampion() {

    if (inputWarrior.checked) {
        playerChampionSpan.innerHTML = inputWarrior.id
        playerChampion = inputWarrior.id
    } else if (inputMage.checked) {
        playerChampionSpan.innerHTML = inputMage.id
        playerChampion = inputMage.id
    } else if (inputRogue.checked) {
        playerChampionSpan.innerHTML = inputRogue.id
        playerChampion = inputRogue.id
    } else {
        alert('You forgot to pick a Champion!')
        return
    }

    selectChampionSection.style.display = 'none'

    selectChampion(playerChampion)

    extractAttacks(playerChampion)
    seeMapSection.style.display = 'flex'
    startMap()
}

function selectChampion(playerChampion) {
    fetch(`http://192.168.1.2:8080/champion/${playerId}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            champion: playerChampion
        })
    })
}

function extractAttacks(playerChampion) {
    let attacks
    for (let i = 0; i < champions.length; i++) {
        ;
        if (playerChampion === champions[i].name) {
            attacks = champions[i].attacks
        }
    }

    showAttacks(attacks)
}

function showAttacks(attacks) {
    attacks.forEach((attack) => {
        championAttacks = `
        <button id=${attack.id} class="attack-button AButton">${attack.name}</button>
        `
        attacksContainer.innerHTML += championAttacks
    })

    fireButton = document.getElementById('fire-button')
    waterButton = document.getElementById('water-button')
    earthButton = document.getElementById('earth-button')
    buttons = document.querySelectorAll('.AButton')

}

function attackSequence() {
    buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
            if (e.target.textContent === '🔥') {
                playerAttack.push('FIRE')
                console.log(playerAttack)
                button.style.background = '#112F58'
                button.disabled = true
            } else if (e.target.textContent === '💧') {
                playerAttack.push('WATER')
                console.log(playerAttack)
                button.style.background = '#112F58'
                button.disabled = true
            } else {
                playerAttack.push('EARTH')
                console.log(playerAttack)
                button.style.background = '#112F58'
                button.disabled = true
            }
            if (playerAttack.length === 5) {
                sendAttacks()
            }
        })
    })

}

function sendAttacks() {
    fetch(`http://192.168.1.2:8080/champion/${playerId}/attacks`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            attacks: playerAttack
        })
    })

    interval = setInterval(getAttacks, 50)
}

function getAttacks() {
    fetch(`http://192.168.1.2:8080/champion/${enemyId}/attacks`)
        .then(function (res) {
            if (res.ok) {
                res.json()
                    .then(function ({ attacks }) {
                        if (attacks.length == 5) {
                            enemyAttack = attacks
                            combat()
                        }
                    })
            }
        })
}

function selectEnemyChampion() {
    let randomChampion = random(0, champions.length - 1)
    enemyChampionSpan.innerHTML = champions[randomChampion].name
    enemyChampionAttacks = champions[randomChampion].attacks
    attackSequence()
}

function enemyRandomAttack() {
    console.log('Enemy attacks', enemyChampionAttacks);
    let randomAttack = random(0, enemyChampionAttacks.length - 1)

    if (randomAttack == 0 || randomAttack == 1) {
        enemyAttack.push('FIRE')
    } else if (randomAttack == 3 || randomAttack == 4) {
        enemyAttack.push('WATER')
    } else {
        enemyAttack.push('EARTH')
    }
    console.log(enemyAttack)
    startFight()
}

function startFight() {
    if (playerAttack.length === 5) {
        combat()
    }

}

function bothOpponentsIndex(player, enemy) {
    indexPlayerAttack = playerAttack[player]
    indexEnemyAttack = enemyAttack[enemy]
}

function combat() {
    clearInterval(interval)

    for (let index = 0; index < playerAttack.length; index++) {
        if (playerAttack[index] === enemyAttack[index]) {
            bothOpponentsIndex(index, index)
            createMessage("TIE")
            playerLifeSpan.innerHTML = playerWins
        } else if (playerAttack[index] === 'FIRE' && enemyAttack[index] === 'EARTH') {
            bothOpponentsIndex(index, index)
            createMessage("YOU WIN")
            playerWins++
            playerLifeSpan.innerHTML = playerWins
        } else if (playerAttack[index] === 'EARTH' && enemyAttack[index] === 'WATER') {
            bothOpponentsIndex(index, index)
            createMessage("YOU WIN")
            playerWins++
            playerLifeSpan.innerHTML = playerWins
        } else if (playerAttack[index] === 'WATER' && enemyAttack[index] === 'FIRE') {
            bothOpponentsIndex(index, index)
            createMessage("YOU WIN")
            playerWins++
            playerLifeSpan.innerHTML = playerWins
        } else {
            bothOpponentsIndex(index, index)
            createMessage("YOU LOSE")
            enemyWins++
            enemyLifeSpan.innerHTML = enemyWins
        }
    }

    checkLife()
}

function checkLife() {
    if (playerWins === enemyWins) {
        createFinalMessage("This was a tie!")
    } else if (playerLifes > enemyWins) {
        createFinalMessage("Congrats! You win!")
    } else {
        createFinalMessage("Sorry, you lose :(")
    }
}

function createMessage(score) {

    let newPlayerAttack = document.createElement('p')
    let newEnemyAttack = document.createElement('p')

    messagesSection.innerHTML = score
    newPlayerAttack.innerHTML = indexPlayerAttack
    newEnemyAttack.innerHTML = indexEnemyAttack

    playerAttacks.appendChild(newPlayerAttack)
    enemyAttacks.appendChild(newEnemyAttack)
}

function createFinalMessage(finalScore) {
    messagesSection.innerHTML = finalScore
    restartGameSection.style.display = 'block'
}

function restartGame() {
    location.reload()
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function paintCanvas() {
    playerChampionObject.x = playerChampionObject.x + playerChampionObject.speedX
    playerChampionObject.y = playerChampionObject.y + playerChampionObject.speedY
    canvas.clearRect(0, 0, map.width, map.height)
    canvas.drawImage(
        mapBackground,
        0,
        0,
        map.width,
        map.height
    )
    playerChampionObject.paintChampion()

    sendPosition(playerChampionObject.x, playerChampionObject.y)

    enemiesChampions.forEach(function (champion) {
        champion.paintChampion()
        checkCollision(champion)
    })
}

function sendPosition(x, y) {
    fetch(`http://192.168.1.2:8080/champion/${playerId}/position`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            x,
            y
        })
    })
        .then(function (res) {
            if (res.ok) {
                res.json()
                    .then(function ({ enemies }) {
                        console.log(enemies)
                        enemiesChampions = enemies.map(function (enemy) {
                            let enemyChampion = null
                            const championName = enemy.champion.name || ""
                            if (championName === "Warrior") {
                                enemyChampion = new Champion('Warrior', './assets/warrior1.gif', 5, './assets/warrior1.gif', enemy.id)
                            } else if (championName === "Mage") {
                                enemyChampion = new Champion('Mage', './assets/mage1.gif', 5, 'assets/mage1.gif', enemy.id)
                            } else if (championName === "Rogue") {
                                enemyChampion = new Champion('Rogue', './assets/rogue1.gif', 5, './assets/rogue1.gif', enemy.id)
                            }

                            enemyChampion.x = enemy.x
                            enemyChampion.y = enemy.y

                            return enemyChampion
                        })
                    })
            }
        })
}

function moveUp() {
    playerChampionObject.speedY = -5
}

function moveLeft() {
    playerChampionObject.speedX = -5
}

function moveDown() {
    playerChampionObject.speedY = 5
}

function moveRight() {
    playerChampionObject.speedX = 5
}

function stopMovement() {
    playerChampionObject.speedY = 0
    playerChampionObject.speedX = 0
}

function keyPressed(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveUp()
            break
        case 'ArrowDown':
            moveDown()
            break
        case 'ArrowLeft':
            moveLeft()
            break
        case 'ArrowRight':
            moveRight()
            break
        default:
            break
    }
}

function startMap() {

    playerChampionObject = getChampionObject(playerChampion)
    console.log(playerChampionObject, playerChampion);

    interval = setInterval(paintCanvas, 50)

    window.addEventListener('keydown', keyPressed)

    window.addEventListener('keyup', stopMovement)
}

function getChampionObject() {
    for (let i = 0; i < champions.length; i++) {
        ;
        if (playerChampion === champions[i].name) {
            return champions[i]
        }
    }
}

function checkCollision(enemy) {
    const enemyUp = enemy.y
    const enemyDown = enemy.y + enemy.height
    const enemyRight = enemy.x + enemy.width
    const enemyLeft = enemy.x

    const championUp =
        playerChampionObject.y
    const championDown =
        playerChampionObject.y + playerChampionObject.height
    const chamionRight =
        playerChampionObject.x + playerChampionObject.width
    const championLeft =
        playerChampionObject.x

    if (
        championDown < enemyUp ||
        championUp > enemyDown ||
        chamionRight < enemyLeft ||
        championLeft > enemyRight
    ) {
        return
    }

    stopMovement()
    clearInterval(interval)
    console.log('¡FIGHT!');

    enemyId = enemy.id
    selectAttackSection.style.display = 'flex'
    seeMapSection.style.display = 'none'
    selectEnemyChampion(enemy)
}

window.addEventListener('load', startGame)