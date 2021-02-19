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
    moveViruses(stage) {
        if (stage == 0) {
            this.movingViruses.yellow.style.top = "-216px";
            this.movingViruses.yellow.style.left = "44px";

            this.movingViruses.blue.style.top = "-135px";
            this.movingViruses.blue.style.left = "-41px";

            this.movingViruses.brown.style.top = "-184px";
            this.movingViruses.brown.style.left = "32px";
        }
        if (stage == 1) {
            this.movingViruses.yellow.style.top = "-216px";
            this.movingViruses.yellow.style.left = "28px";

            this.movingViruses.blue.style.top = "-135px";
            this.movingViruses.blue.style.left = "-25px";

            this.movingViruses.brown.style.top = "-168px";
            this.movingViruses.brown.style.left = "32px";
        }
        if (stage == 2) {

            this.movingViruses.yellow.style.top = "-216px";
            this.movingViruses.yellow.style.left = "12px";

            this.movingViruses.blue.style.top = "-151px";
            this.movingViruses.blue.style.left = "-9px";

            this.movingViruses.brown.style.top = "-152px";
            this.movingViruses.brown.style.left = "48px";
        }
        if (stage == 3) {

            this.movingViruses.yellow.style.top = "-216px";
            this.movingViruses.yellow.style.left = "-4px";

            this.movingViruses.blue.style.top = "-167px";
            this.movingViruses.blue.style.left = "-9px";

            this.movingViruses.brown.style.top = "-136px";
            this.movingViruses.brown.style.left = "48px";
        }
        if (stage == 4) {

            this.movingViruses.yellow.style.top = "-200px";
            this.movingViruses.yellow.style.left = "-20px";

            this.movingViruses.blue.style.top = "-183px";
            this.movingViruses.blue.style.left = "-9px";

            this.movingViruses.brown.style.top = "-136px";
            this.movingViruses.brown.style.left = "64px";
        }


        if (stage == 5) {

            this.movingViruses.yellow.style.top = "-184px";
            this.movingViruses.yellow.style.left = "-36px";

            this.movingViruses.blue.style.top = "-199px";
            this.movingViruses.blue.style.left = "-9px";

            this.movingViruses.brown.style.top = "-136px";
            this.movingViruses.brown.style.left = "80px";
        }
        if (stage == 6) {

            this.movingViruses.yellow.style.top = "-184px";
            this.movingViruses.yellow.style.left = "-36px";

            this.movingViruses.blue.style.top = "-215px";
            this.movingViruses.blue.style.left = "-25px";

            this.movingViruses.brown.style.top = "-136px";
            this.movingViruses.brown.style.left = "96px";
        }
        if (stage == 7) {

            this.movingViruses.yellow.style.top = "-168px";
            this.movingViruses.yellow.style.left = "-36px";

            this.movingViruses.blue.style.top = "-215px";
            this.movingViruses.blue.style.left = "-41px";

            this.movingViruses.brown.style.top = "-136px";
            this.movingViruses.brown.style.left = "112px";
        }
        if (stage == 8) {

            this.movingViruses.yellow.style.top = "-152px";
            this.movingViruses.yellow.style.left = "-20px";

            this.movingViruses.blue.style.top = "-215px";
            this.movingViruses.blue.style.left = "-57px";

            this.movingViruses.brown.style.top = "-152px";
            this.movingViruses.brown.style.left = "128px";
        }
        if (stage == 9) {

            this.movingViruses.yellow.style.top = "-136px";
            this.movingViruses.yellow.style.left = "-20px";

            this.movingViruses.blue.style.top = "-215px";
            this.movingViruses.blue.style.left = "-73px";

            this.movingViruses.brown.style.top = "-168px";
            this.movingViruses.brown.style.left = "128px";
        }
        if (stage == 10) {

            this.movingViruses.yellow.style.top = "-136px";
            this.movingViruses.yellow.style.left = "-4px";

            this.movingViruses.blue.style.top = "-199px";
            this.movingViruses.blue.style.left = "-89px";

            this.movingViruses.brown.style.top = "-184px";
            this.movingViruses.brown.style.left = "128px";
        }
        if (stage == 11) {

            this.movingViruses.yellow.style.top = "-136px";
            this.movingViruses.yellow.style.left = "12px";

            this.movingViruses.blue.style.top = "-183px";
            this.movingViruses.blue.style.left = "-105px";

            this.movingViruses.brown.style.top = "-200px";
            this.movingViruses.brown.style.left = "128px";
        }
        if (stage == 12) {

            this.movingViruses.yellow.style.top = "-136px";
            this.movingViruses.yellow.style.left = "28px";

            this.movingViruses.blue.style.top = "-183px";
            this.movingViruses.blue.style.left = "-105px";

            this.movingViruses.brown.style.top = "-216px";
            this.movingViruses.brown.style.left = "112px";
        }
        if (stage == 13) {

            this.movingViruses.yellow.style.top = "-136px";
            this.movingViruses.yellow.style.left = "44px";

            this.movingViruses.blue.style.top = "-167px";
            this.movingViruses.blue.style.left = "-105px";

            this.movingViruses.brown.style.top = "-216px";
            this.movingViruses.brown.style.left = "100px";
        }
        if (stage == 14) {
            this.movingViruses.yellow.style.top = "-152px";
            this.movingViruses.yellow.style.left = "60px";

            this.movingViruses.blue.style.top = "-151px";
            this.movingViruses.blue.style.left = "-89px";

            this.movingViruses.brown.style.top = "-216px";
            this.movingViruses.brown.style.left = "84px";
        }
        if (stage == 15) {
            this.movingViruses.yellow.style.top = "-168px";
            this.movingViruses.yellow.style.left = "60px";

            this.movingViruses.blue.style.top = "-135px";
            this.movingViruses.blue.style.left = "-89px";

            this.movingViruses.brown.style.top = "-216px";
            this.movingViruses.brown.style.left = "68px";
        }

        if (stage == 16) {
            this.movingViruses.yellow.style.top = "-184px";
            this.movingViruses.yellow.style.left = "60px";

            this.movingViruses.blue.style.top = "-135px";
            this.movingViruses.blue.style.left = "-73px";

            this.movingViruses.brown.style.top = "-200px";
            this.movingViruses.brown.style.left = "52px";
        }
    },
    throwPill() {
        this.generateNewPill()
        const checkGameOver = this.gameOver()
        if (checkGameOver) return;
        const throwInterval = 30;
        setTimeout(() => {

            this.isKeyboardLocked = true;
            setTimeout(() => {
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval)
            setTimeout(() => {
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("up", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 2)
            setTimeout(() => {
                this.setHand("middle")
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 3)
            setTimeout(() => {
                this.handPill.rotate("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("up", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                this.refreshBoard(this.tiles, this.bckgTiles)
            }, throwInterval * 4)
            for (let i = 0; i <= 7; i++) {
                setTimeout(() => {
                    this.setHand("down")
                    this.handPill.move("left", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                    this.refreshBoard(this.tiles, this.bckgTiles)
                }, throwInterval * 5 + i * throwInterval)
            }
            for (let i = 0; i <= 4; i++) {
                setTimeout(() => {
                    this.handPill.move("down", this.bckgTiles, this.tiles, this.bckgTiles, this.refreshBoard)
                    this.refreshBoard(this.tiles, this.bckgTiles)
                    if (i == 4) {
                        this.setHand("up")
                        this.bckgTiles[6][20].free()
                        this.bckgTiles[6][21].free()
                        this.refreshBoard(this.tiles, this.bckgTiles)
                        this.isKeyboardLocked = false;
                        this.generateNextPill()
                    }
                }, throwInterval * 12 + i * throwInterval + 100)
            }
        }, 400)


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

            while (y <= 12) y = Math.floor(Math.random() * this.height)
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
const startBtn = document.getElementById('startBtn');
startBtn.onclick = function () {
    game.start()
}
window.game = game


