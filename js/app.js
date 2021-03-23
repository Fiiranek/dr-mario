"use strict";
import { checkRowStrikes, checkColumnStrikes } from './utils.js'
import { Pill, Tile } from './models.js'
const game = {
    isStarted: false,
    colors: ["blue", "brown", "yellow"],
    virusColors: ["blue", "brown", "yellow"],
    width: 8,
    height: 16,
    board: document.getElementById('board'),
    bckgBoard: document.getElementById('bckgBoard'),
    startBtn: document.getElementById('startBtn'),
    tiles: [],
    bckgTiles: [],
    pills: [],
    delay: 1000,
    fallDelay: 25,
    smashFallDelay: 100,
    heightCounter: 0,
    score: 0,
    viruses: 0,
    isKeyboardLocked: false,
    currentPill: undefined,
    handPill: undefined,
    gameInterval: undefined,
    fallInterval: undefined,
    isKeyDown: false,
    currentEvent: false,
    movingViruses: {
        yellow: document.getElementById("virusYellow"),
        brown: document.getElementById("virusBrown"),
        blue: document.getElementById("virusBlue"),
    },
    virusesMoveInterval: undefined,
    init: function () {
        this.tiles = [];
        this.bckgTiles = [];

        // CREATE TILES
        for (let i = 0; i < this.height; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.width; j++) {
                const tile = new Tile(i, j, false);
                tile.init(this.board)
                this.tiles[i].push(tile)
            }
        }

        // CREATE BCKG TILES
        for (let i = 0; i < 24; i++) {
            this.bckgTiles.push([]);
            for (let j = 0; j < 40; j++) {
                const bckgTile = new Tile(i, j, true);
                bckgTile.init(this.bckgBoard)
                this.bckgTiles[i].push(bckgTile)
            }
        }

        // RANDOMIZE VIRUSES
        this.randomizeViruses(4);

        // REFRESH SCORE
        this.refreshMenu()


        document.onkeydown = (e) => {
            this.currentEvent = e;
            this.isKeyDown = true;
            if (!this.isKeyboardLocked) {

                // W or UP
                if (e.keyCode == 87 || e.keyCode == 38) {
                    this.currentPill.rotate("left", this.tiles, this.tiles, this.bckgTiles, this.refreshBoard)
                }
                // SHIFT
                if (e.keyCode == 16) {
                    this.currentPill.rotate("right", this.tiles, this.tiles, this.bckgTiles, this.refreshBoard)
                }
                // S or DOWN
                if (e.keyCode == 83 || e.keyCode == 40) {
                    this.isKeyboardLocked = true;
                    this.refreshBoard(this.tiles, this.bckgTiles)
                    clearInterval(this.gameInterval)
                    //this.gameIntervalCounter = 0
                    this.gameInterval = setInterval(() => {
                        this.intervalFunction()
                    }, this.fallDelay)
                }
            }
        }

        document.onkeyup = (e) => {
            this.currentEvent = undefined;
            this.isKeyDown = false;
        }

        setInterval(() => {
            if (this.isKeyDown && !this.isKeyboardLocked) {
                const e = this.currentEvent;

                // A or LEFT
                if (e.keyCode == 65 || e.keyCode == 37) {
                    this.currentPill.move("left", this.tiles, this.tiles, this.bckgTiles, this.refreshBoard);
                }
                // D or RIGHT
                if (e.keyCode == 68 || e.keyCode == 39) {
                    this.currentPill.move("right", this.tiles, this.tiles, this.bckgTiles, this.refreshBoard);
                }
            }
        }, 50)

        //this.generateNewPill()
        this.generateNextPill()
        this.setHand("up")
        this.moveViruses(0)
        this.refreshBoard(this.tiles, this.bckgTiles)

        let virusesMoveIntervalCounter = 0
        this.virusesMoveInterval = setInterval(() => {
            setTimeout(() => this.setViruses(1), 200)
            setTimeout(() => this.setViruses(2), 400)
            setTimeout(() => this.setViruses(3), 600)
            setTimeout(() => this.setViruses(2), 800)
            if (virusesMoveIntervalCounter == 17) virusesMoveIntervalCounter = 0
            this.moveViruses(virusesMoveIntervalCounter)
            virusesMoveIntervalCounter++;
        }, 1000)
    },
    setHand(position) {
        if (position == "up") {
            this.bckgTiles[4][31].img = `hands/up_1`
            this.bckgTiles[5][31].img = `hands/up_2`
            this.bckgTiles[6][31].img = `hands/up_3`
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[5][30].img = ""
            this.bckgTiles[6][30].img = ""
            this.bckgTiles[7][30].img = ""
            this.bckgTiles[7][31].img = ""
            this.refreshBoard(this.tiles, this.bckgTiles)
            return;
        }
        if (position == "middle") {
            this.bckgTiles[4][31].img = ``
            this.bckgTiles[5][31].img = `hands/middle12`
            this.bckgTiles[6][31].img = `hands/middle22`
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[5][30].img = "hands/middle11"
            this.bckgTiles[6][30].img = "hands/middle21"
            this.bckgTiles[7][30].img = ""
            this.bckgTiles[7][31].img = ""
            this.refreshBoard(this.tiles, this.bckgTiles)
            return;
        }
        if (position == "down") {
            this.bckgTiles[4][31].img = ``
            this.bckgTiles[5][31].img = ``
            this.bckgTiles[6][31].img = `hands/down_1`
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[4][30].img = ""
            this.bckgTiles[5][30].img = ""
            this.bckgTiles[6][30].img = ""
            this.bckgTiles[7][30].img = ""
            this.bckgTiles[7][31].img = "hands/down_2"
            this.refreshBoard(this.tiles, this.bckgTiles)
            return;
        }
    },
    setViruses(position) {
        this.movingViruses.yellow.src = `./img/lupa/yl/${position}.png`;
        this.movingViruses.blue.src = `./img/lupa/bl/${position}.png`;
        this.movingViruses.brown.src = `./img/lupa/br/${position}.png`;
    },
    setVirusesPositions(ylTop, ylLeft, blTop, blLeft, brTop, brLeft) {
        this.movingViruses.yellow.style.top = `${ylTop}px`;
        this.movingViruses.yellow.style.left = `${ylLeft}px`;
        this.movingViruses.blue.style.top = `${blTop}px`;
        this.movingViruses.blue.style.left = `${blLeft}px`;
        this.movingViruses.brown.style.top = `${brTop}px`;
        this.movingViruses.brown.style.left = `${brLeft}px`;
    },
    moveViruses(stage) {
        if (stage == 0) this.setVirusesPositions(-216, 44, -135, -41, -184, 32)
        if (stage == 1) this.setVirusesPositions(-216, 28, -135, -25, -168, 32)
        if (stage == 2) this.setVirusesPositions(-216, 12, -151, -9, -152, 48)
        if (stage == 3) this.setVirusesPositions(-216, -4, -167, -9, -136, 48)
        if (stage == 4) this.setVirusesPositions(-200, -20, -183, -9, -136, 64)
        if (stage == 5) this.setVirusesPositions(-184, -36, -199, -9, -136, 80)
        if (stage == 6) this.setVirusesPositions(-184, -36, -215, -25, -136, 96)
        if (stage == 7) this.setVirusesPositions(-168, -36, -215, -41, -136, 112)
        if (stage == 8) this.setVirusesPositions(-152, -20, -215, -57, -152, 128)
        if (stage == 9) this.setVirusesPositions(-136, -20, -215, -73, -168, 128)
        if (stage == 10) this.setVirusesPositions(-136, -4, -199, -89, -184, 128)
        if (stage == 11) this.setVirusesPositions(-136, 12, -183, -105, -200, 128)
        if (stage == 12) this.setVirusesPositions(-136, 28, -183, -105, -216, 112)
        if (stage == 13) this.setVirusesPositions(-136, 44, -167, -105, -216, 100)
        if (stage == 14) this.setVirusesPositions(-152, 60, -151, -89, -216, 84)
        if (stage == 15) this.setVirusesPositions(-168, 60, -135, -89, -216, 68)
        if (stage == 16) this.setVirusesPositions(-184, 60, -135, -73, -200, 52)
    },
    rotateHandPillLeft() {
        this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
        this.refreshBoard(this.tiles, this.bckgTiles)
    },
    rotateAndMoveHandPillLeft() {
        this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
        this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
        this.refreshBoard(this.tiles, this.bckgTiles)
    },
    throwPill() {
        this.generateNewPill()
        const checkGameOver = this.gameOver()
        if (checkGameOver) return;
        const throwInterval = 30;
        setTimeout(() => {

            this.isKeyboardLocked = true;
            setTimeout(() => this.rotateHandPillLeft(), throwInterval)
            setTimeout(() => {
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("up", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 2)
            setTimeout(() => {
                this.setHand("middle")
                this.rotateHandPillLeft()
            }, throwInterval * 3)
            setTimeout(() => {
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("up", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 4)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 5)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 6)
            setTimeout(() => {
                this.setHand("down")
                this.rotateHandPillLeft()
            }, throwInterval * 7)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 8)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 9)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 10)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 11)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 12)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 13)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 14)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 15)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 16)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 17)
            setTimeout(() => {
                this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("down", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 18)
            setTimeout(() => this.rotateHandPillLeft(), throwInterval * 19)
            setTimeout(() => this.rotateAndMoveHandPillLeft(), throwInterval * 20)
            for (let i = 0; i <= 4; i++) {
                setTimeout(() => {
                    this.handPill.move("down", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                    this.refreshBoard(this.tiles, this.bckgTiles)
                    if (i == 4) {
                        this.setHand("up")
                        this.refreshBoard(this.tiles, this.bckgTiles)
                        this.isKeyboardLocked = false;
                        this.generateNextPill()
                        this.bckgTiles[6][20].free()
                        this.bckgTiles[6][21].free()
                        this.isKeyboardLocked = false;
                    }
                }, throwInterval * 21 + i * throwInterval)
            }
            //}, 400)
        }, 10)
    },
    refreshScore() {
        let topScore = localStorage.getItem("topScore")
        if (topScore == null) topScore = 0
        if (this.score > topScore) {
            topScore = this.score;
            localStorage.setItem('topScore', topScore);
        }

        // REFRESH SCORE
        let scoreString = "0000000";
        let scoreStartIndex = 7 - this.score.toString().length;
        scoreString = scoreString.substring(scoreStartIndex, 0)
        scoreString += this.score.toString()

        // REFRESH TOP SCORE
        let topScoreString = "0000000";
        let topScoreStartIndex = 7 - topScore.toString().length;
        topScoreString = topScoreString.substring(topScoreStartIndex, 0)
        topScoreString += topScore.toString()

        for (let i = 0; i < 7; i++) {
            this.bckgTiles[5][5 + i].img = `cyfry/${topScoreString[i]}`
            this.bckgTiles[8][5 + i].img = `cyfry/${scoreString[i]}`
        }

    },
    refreshMenu() {
        // REFRESH SCORE
        this.refreshScore()
        // REFRESH VIRUSES
        let virusesNumber = this.viruses > 9 ? this.viruses.toString() : "0" + this.viruses.toString();
        this.bckgTiles[21][35].img = `cyfry/${virusesNumber[0]}`;
        this.bckgTiles[21][36].img = `cyfry/${virusesNumber[1]}`;
        this.refreshBoard(this.tiles, this.bckgTiles)
    },
    randomizeViruses(number) {
        this.viruses = number;
        const viruses = [];
        for (let i = 0; i < number; i++) {
            let x = Math.floor(Math.random() * this.width)
            let y = Math.floor(Math.random() * this.height)
            let color = this.virusColors[i % this.virusColors.length];

            while (y <= 5) y = Math.floor(Math.random() * this.height)
            let checkIfOccuped = true;
            let isVirusSameCoords = false;
            while (checkIfOccuped) {
                isVirusSameCoords = false
                viruses.forEach((virusCoord) => {
                    if (x == virusCoord.x && y == virusCoord.y) {
                        isVirusSameCoords = true
                    }
                })
                if (isVirusSameCoords) {
                    checkIfOccuped = true
                    x = Math.floor(Math.random() * this.width)
                    y = Math.floor(Math.random() * this.height)
                    while (y <= 5) y = Math.floor(Math.random() * this.height)
                }
                else {
                    checkIfOccuped = false;
                    viruses.push({ y: y, x: x, color: color })
                }
            }
        }
        viruses.forEach((virus) => {
            this.tiles[virus.y][virus.x].isVirus = true;
            this.tiles[virus.y][virus.x].color = virus.color;
            if (virus.color == "yellow") {
                this.tiles[virus.y][virus.x].img = "covid_yellow";
            }
            else if (virus.color == "brown") {
                this.tiles[virus.y][virus.x].img = "covid_brown";
            }
            else if (virus.color == "blue") {
                this.tiles[virus.y][virus.x].img = "covid_blue";
            }
        })
        this.refreshBoard(this.tiles, this.bckgTiles)
    },
    canStartFalling: function () {
        for (let i = 0; i < this.pills.length; i++) {
            const canFall = this.pills[i].canFall(this.tiles)
            if (canFall) return true;
        }
        return false;
    },

    fallPills: function () {
        let didAynPillFall = false;
        for (let i = this.height - 2; i >= 0; i--) {
            for (let j = 0; j < this.width; j++) {
                if (!this.tiles[i][j].isFree()) {
                    let pillID = this.tiles[i][j].pillID
                    const pill = this.pills.find(e => e.ID == pillID)
                    if (pill) {
                        let canFall = pill.canFall(this.tiles)
                        if (canFall) {
                            pill.fall(this.tiles)
                            didAynPillFall = true;
                        }
                    }
                }
            }
        }
        this.refreshBoard(this.tiles, this.bckgTiles)
        if (didAynPillFall) return true;
        return false;

    },
    checkPillSmash: function () {
        const rowStrikes = checkRowStrikes(this.width, this.height, this.tiles);
        const columnStrikes = checkColumnStrikes(this.width, this.height, this.tiles);
        const strikes = rowStrikes.concat(columnStrikes);
        if (strikes.length > 0) return strikes
        return false
    },
    smashPills(strikes) {
        strikes.forEach((strike) => {
            // NO VIRUS
            if (!this.tiles[strike.y][strike.x].isVirus) {
                const pillID = this.tiles[strike.y][strike.x].pillID
                const pill = this.pills.find(e => e.ID == pillID);
                if (pill) {
                    const shouldRemovePill = pill.modify(strike, this.tiles)
                    if (shouldRemovePill) {
                        const pillIndex = this.pills.findIndex(e => e.ID == pillID);

                        this.pills.splice(pillIndex, 1)
                    }
                    let smashedPillColor = this.tiles[strike.y][strike.x].color;
                    this.tiles[strike.y][strike.x].free();

                    this.tiles[strike.y][strike.x].smashAnimation(smashedPillColor, this.tiles, this.bckgTiles, strike, this.refreshBoard, false)
                    this.refreshBoard(this.tiles, this.bckgTiles)
                }
            }
            // SMASH VIRUS
            else {
                let smashedPillColor = this.tiles[strike.y][strike.x].color;
                this.tiles[strike.y][strike.x].isVirus = false;
                this.tiles[strike.y][strike.x].free();
                this.tiles[strike.y][strike.x].smashAnimation(smashedPillColor, this.tiles, this.bckgTiles, strike, this.refreshBoard, true)
                this.refreshBoard(this.tiles, this.bckgTiles)
                this.score += 100;
                this.viruses -= 1;
                this.refreshMenu()
                this.checkWin()
            }
        })
    },
    checkWin() {
        if (this.score == 400) {
            this.isStarted = false;
            clearInterval(this.gameInterval)
            clearInterval(this.fallInterval)
            this.isKeyboardLocked = true;
            document.getElementById("gameOverDr").style.display = "none";
            document.getElementById("gameOverPanel").src = "/img/sc.png"
            document.getElementById("gameOverScreen").style.display = "block";
        }
    },
    refreshBoard: function (tiles, bckgTiles) {
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 8; j++) tiles[i][j].refresh();
        }
        bckgTiles.forEach((row) => {
            row.forEach((tile) => tile.refresh())
        })
    },
    generateNextPill() {
        const colorLeft = this.colors[Math.floor(Math.random() * this.colors.length)];
        const colorRight = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.handPill = new Pill(30, 3, "horizontal", colorLeft, colorRight);
        this.bckgTiles[3][30].modify(this.handPill.colorLeft, this.handPill.ID, "left")
        this.bckgTiles[3][31].modify(this.handPill.colorRight, this.handPill.ID, "right")
    },
    generateNewPill: function () {
        this.refreshBoard(this.tiles, this.bckgTiles)
        const colorLeft = this.handPill.colorLeft
        const colorRight = this.handPill.colorRight
        this.currentPill = new Pill(3, 0, "horizontal", colorLeft, colorRight);
        this.refreshBoard(this.tiles, this.bckgTiles)
        this.bckgTiles[3][30].modify(this.handPill.colorLeft, this.handPill.ID, "left")
        this.bckgTiles[3][31].modify(this.handPill.colorRight, this.handPill.ID, "right")
        this.heightCounter = 0;
    },
    checkStopPill: function (pill) {
        if (this.heightCounter > 0) {
            let x1 = pill.coords.x1
            let x2 = pill.coords.x2
            let y1 = pill.coords.y1
            let y2 = pill.coords.y2
            if (y1 == 15) {
                this.stopPill()
                return true;
            }
            // HORIZONTAL
            if (pill.position == "horizontal") {
                if (!this.tiles[y1 + 1][x1].isFree() || !this.tiles[y2 + 1][x2].isFree()) {
                    this.stopPill()
                    return true;
                }
                return false;
            }
            // VERTICAL
            if (pill.position == "vertical") {
                if (!this.tiles[y1 + 1][x1].isFree()) {
                    this.stopPill()
                    return true;
                }
                return false;
            }
        }

    },
    stopPill() {
        this.pills.push(this.currentPill)
        this.isKeyboardLocked = false;
        this.didStop = true;
        this.generateNewPill();
        this.isKeyboardLocked = true;
    },
    movePillDown: function (pill) {
        if (this.heightCounter > 0) {
            this.currentPill.coords.y1 += 1;
            this.currentPill.coords.y2 += 1;
        }
        let x1 = pill.coords.x1
        let x2 = pill.coords.x2
        let y1 = pill.coords.y1
        let y2 = pill.coords.y2
        this.heightCounter += 1
        // HORIZONTAL
        if (pill.position == "horizontal") {
            this.tiles[y1][x1].modify(pill.colorLeft, pill.ID, "left")
            this.tiles[y1][x2].modify(pill.colorRight, pill.ID, "right")

            if (y1 > 0) {
                this.tiles[y1 - 1][x1].free()
                this.tiles[y1 - 1][x2].free()
                return;
            }
            return;
        }
        // VERTICAL
        if (pill.position == "vertical") {
            this.tiles[y1][x1].modify(pill.colorBottom, pill.ID, "bottom")
            this.tiles[y2][x1].modify(pill.colorTop, pill.ID, "top")
            if (y1 > 1) this.tiles[y2 - 1][x1].free()
        }
    },
    gameIntervalCounter: 0,
    didStop: false,
    canCurrentPillFall: true,
    smashAndFallProcess(werePillSmashed) {

        this.smashPills(werePillSmashed)
        let canStartFalling = this.canStartFalling()
        if (canStartFalling) {
            setTimeout(() => {
                this.canCurrentPillFall = false;
                this.isKeyboardLocked = true;
                clearInterval(this.gameInterval);
                this.fallInterval = setInterval(() => {
                    this.fallPills()
                    let canStartFalling = this.canStartFalling()
                    if (!canStartFalling) {
                        clearInterval(this.fallInterval);
                        werePillSmashed = this.checkPillSmash()
                        if (werePillSmashed) {
                            this.smashAndFallProcess(werePillSmashed)
                        }
                        else {
                            clearInterval(this.fallInterval);
                            this.isKeyboardLocked = false;
                            this.canCurrentPillFall = true;
                            if (this.isStarted) this.throwPill()
                            this.gameInterval = setInterval(() => this.intervalFunction(), this.delay);
                            return;
                        }
                    }
                }, this.smashFallDelay)
            }, 400)
        }
        else {
            if (this.isStarted) {
                this.throwPill()
            }
        }

    },
    intervalFunction: function () {
        if (this.isStarted) {
            this.refreshBoard(this.tiles, this.bckgTiles)
            let didStop = this.checkStopPill(this.currentPill);
            if (didStop) {

                clearInterval(this.gameInterval)
                this.gameInterval = setInterval(() => this.intervalFunction(), this.delay);
                let werePillSmashed = this.checkPillSmash()
                if (werePillSmashed) this.smashAndFallProcess(werePillSmashed)
                else {
                    if (this.isStarted) this.throwPill()
                }
                return;
            }

            if (this.canCurrentPillFall && this.canCurrentPillFall) this.movePillDown(this.currentPill)

            this.refreshBoard(this.tiles, this.bckgTiles)
        }

    },
    start() {
        this.isStarted = true;
        this.throwPill()
        this.gameInterval = setInterval(() => this.intervalFunction(), this.delay)
        this.refreshBoard(this.tiles, this.bckgTiles)
    },
    gameOver() {
        if (!this.tiles[0][3].isFree() || !this.tiles[0][4].isFree()) {
            clearInterval(this.virusesMoveInterval)
            clearInterval(this.gameInterval)
            this.isKeyboardLocked = true;
            this.setViruses(2)
            this.virusesMoveInterval = setInterval(() => {
                setTimeout(() => this.setViruses(4), 200)
                setTimeout(() => this.setViruses(2), 400)
            }, 400)
            document.getElementById('gameOverScreen').style.display = "block";
            return true
        }
        return false
    }

}


game.init()
setTimeout(()=>game.start(),2000)
