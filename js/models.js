export class Tile {
    constructor(i, j, isBckg) {
        this.i = i;
        this.j = j;
        this.x = this.j < 10 ? `0${this.j}` : this.j;
        this.y = this.i < 10 ? `0${this.i}` : this.i;
        this.color = "white";
        this.pillID = "";
        this.isVirus = false;
        this.img = "";
        this.divID = "";
        this.isBckg = isBckg
    }
    init = (board) => {
        this.isBckg ? this.divID = `bckg${this.x}${this.y}` : this.divID = `${this.x}${this.y}`;
        const tileDiv = document.createElement('div');
        // tileDiv.classList.add('tile');
        this.isBckg ? tileDiv.classList.add('bckgTile') : tileDiv.classList.add('tile');
        tileDiv.id = this.divID;
        this.tile = tileDiv;
        tileDiv.dataset.color = this.color;
        board.appendChild(tileDiv);
    }
    refresh = () => {
        document.getElementById(this.divID).dataset.pillid = this.pillID;

        if (this.isSingle) {
            if (this.color == "yellow") {
                this.img = "yl_dot"
            }
            else if (this.color == "blue") {
                this.img = "bl_dot"
            }
            else if (this.color == "brown") {
                this.img = "br_dot"
            }
        }
        if (this.img != "") {
            document.getElementById(this.divID).style.background = `url(./img/${this.img}.png)`;
            document.getElementById(this.divID).style.backgroundPosition = "center";
            document.getElementById(this.divID).style.backgroundSize = "cover";
            document.getElementById(this.divID).style.backgroundRepeat = "no-repeat";
        }
        else document.getElementById(this.divID).style.background = "none";
    }

    modify = (color, pillID = "", pillPart) => {
        this.color = color;
        this.pillID = pillID;
        switch (pillPart) {
            case "single":
                if (color == "yellow") {
                    this.img = "yl_dot";
                }
                else if (color == "brown") {
                    this.img = "br_dot";
                }
                else if (color == "blue") {
                    this.img = "bl_dot";
                }
                break;
            case "top":
                if (color == "yellow") {
                    this.img = "yl_up";
                }
                else if (color == "brown") {
                    this.img = "br_up";
                }
                else if (color == "blue") {
                    this.img = "bl_up";
                }
                break;
            case "bottom":
                if (color == "yellow") {
                    this.img = "yl_down";
                }
                else if (color == "brown") {
                    this.img = "br_down";
                }
                else if (color == "blue") {
                    this.img = "bl_down";
                }
                break;
            case "left":
                if (color == "yellow") {
                    this.img = "yl_left";
                }
                else if (color == "brown") {
                    this.img = "br_left";
                }
                else if (color == "blue") {
                    this.img = "bl_left";
                }
                break;
            case "right":
                if (color == "yellow") {
                    this.img = "yl_right";
                }
                else if (color == "brown") {
                    this.img = "br_right";
                }
                else if (color == "blue") {
                    this.img = "bl_right";
                }
                break;
        }

    }
    free = () => {
        this.color = "white";
        this.pillID = "";
        this.img = "";
        this.isSingle = false;
    }
    isFree = () => {
        if (this.color == "white" && this.pillID == "") return true;
        return false;
    }
    smashAnimation = (color, tiles, bckgTiles, strike, refreshBoard, wasVirus) => {
        const smashAnimationDuration = 200;
        if (wasVirus) {
            if (color == "blue") {
                tiles[strike.y][strike.x].img = "../img/bl_x";
            }
            else if (color == "brown") {
                tiles[strike.y][strike.x].img = "../img/br_x";
            }
            else if (color == "yellow") {
                tiles[strike.y][strike.x].img = "../img/yl_x";
            }
        }
        else {
            if (color == "blue") {
                tiles[strike.y][strike.x].img = "../img/bl_o";

            }
            else if (color == "brown") {
                tiles[strike.y][strike.x].img = "../img/br_o";
            }
            else if (color == "yellow") {
                tiles[strike.y][strike.x].img = "../img/yl_o";
            }
        }
        setTimeout(() => {
            tiles[strike.y][strike.x].free();
            refreshBoard(tiles, bckgTiles)
        }, smashAnimationDuration)
    }
}

export class Pill {
    constructor(x, y, position, colorLeft, colorRight) {
        this.ID = this.generateID();
        this.position = position;
        this.colorLeft = colorLeft;
        this.colorRight = colorRight;
        this.colorTop = ""
        this.colorBottom = ""
        this.isSingle = false
        this.color = ""
        this.coords = {
            x1: x,
            y1: y,
            x2: x + 1,
            y2: y
        }
    }
    generateID = () => {
        const ID = Math.random().toString(36).substr(2, 6);
        return ID
    }
    fall = (tiles) => {
        // SINGLE 
        if (this.isSingle) {
            tiles[this.coords.y1][this.coords.x1].free()
            this.coords.y1 += 1
            this.coords.y2 = this.coords.y1
            tiles[this.coords.y1][this.coords.x1].modify(this.color, this.ID, "single")
            return true;
        }
        // VERTICAL
        if (this.position == "vertical") {
            tiles[this.coords.y2][this.coords.x1].free()
            this.coords.y1 += 1
            this.coords.y2 += 1
            tiles[this.coords.y2][this.coords.x1].modify(this.colorTop, this.ID, "top")
            tiles[this.coords.y1][this.coords.x1].modify(this.colorBottom, this.ID, "bottom")
            return true;
        }
        // HORIZONTAL
        if (this.position == "horizontal") {
            tiles[this.coords.y1][this.coords.x1].free()
            tiles[this.coords.y1][this.coords.x2].free()
            this.coords.y1 += 1
            this.coords.y2 = this.coords.y1
            tiles[this.coords.y1][this.coords.x1].modify(this.colorLeft, this.ID, "left")
            tiles[this.coords.y1][this.coords.x2].modify(this.colorRight, this.ID, "right")
            return true;
        }
        return false
    }
    move = (direction, tiles, boardTiles, bckgTiles, refreshBoard) => {
        let x1 = this.coords.x1
        let x2 = this.coords.x2
        let y1 = this.coords.y1
        let y2 = this.coords.y2
        // HORIZONTAL
        if (this.position == "horizontal") {
            //UP
            if (direction == "up") {
                if (y1 > 0 && tiles[y1 - 1][x1].isFree() && tiles[y1 - 1][x2].isFree()) {
                    tiles[y1 - 1][x1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1 - 1][x2].modify(this.colorRight, this.ID, "right")
                    tiles[y1][x1].free()
                    tiles[y1][x2].free()
                    this.coords.y1 -= 1
                    this.coords.y2 -= 1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
            //DOWN
            if (direction == "down") {
                if (tiles[y1 + 1][x1].isFree() && tiles[y1 + 1][x2].isFree()) {
                    tiles[y1 + 1][x1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1 + 1][x2].modify(this.colorRight, this.ID, "right")
                    tiles[y1][x1].free()
                    tiles[y1][x2].free()
                    this.coords.y1 += 1
                    this.coords.y2 += 1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
            // LEFT
            if (direction == "left") {
                if (x1 > 0 && tiles[y1][x1 - 1].isFree()) {
                    tiles[y1][x1 - 1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1].modify(this.colorRight, this.ID, "right")
                    tiles[y1][x1 + 1].free()
                    this.coords.x1 -= 1
                    this.coords.x2 -= 1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
            // RIGHT
            if (direction == "right") {
                if (x2 < 8 - 1 && tiles[y1][x2 + 1].isFree()) {
                    tiles[y1][x2 + 1].modify(this.colorRight, this.ID, "right")
                    tiles[y1][x2].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1].free()
                    this.coords.x1 += 1
                    this.coords.x2 += 1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
        }
        // VERTICAL
        if (this.position == "vertical") {
            // LEFT
            if (direction == "left") {
                if (x1 > 0 && tiles[y1][x1 - 1].isFree() && tiles[y2][x1 - 1].isFree()) {
                    tiles[y1][x1 - 1].modify(this.colorBottom, this.ID, "bottom")
                    tiles[y2][x1 - 1].modify(this.colorTop, this.ID, "top")
                    tiles[y1][x1].free()
                    tiles[y2][x1].free()
                    this.coords.x1 -= 1
                    this.coords.x2 = this.coords.x1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
            // RIGHT
            if (direction == "right") {
                if (x2 < 8 && tiles[y1][x1 + 1].isFree() && tiles[y2][x1 + 1].isFree()) {
                    tiles[y1][x1 + 1].modify(this.colorBottom, this.ID, "bottom")
                    tiles[y2][x1 + 1].modify(this.colorTop, this.ID, "top")

                    tiles[y1][x1].free()
                    tiles[y2][x1].free()
                    this.coords.x1 += 1
                    this.coords.x2 = this.coords.x1
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
        }
    }
    rotate = (direction, tiles, boardTiles, bckgTiles, refreshBoard) => {
        let x1 = this.coords.x1
        let x2 = this.coords.x2
        let y1 = this.coords.y1
        let y2 = this.coords.y2
        // HORIZONTAL
        if (this.position == "horizontal") {
            // LEFT
            if (direction == "left") {
                if (tiles[y1 - 1][x1].isFree()) {
                    y2 = y1 - 1
                    this.coords.y2 = this.coords.y1 - 1
                    this.coords.x2 = this.coords.x1
                    this.colorBottom = this.colorLeft
                    this.colorTop = this.colorRight
                    tiles[y2][x1].modify(this.colorTop, this.ID, "top")
                    tiles[y1][x1].modify(this.colorBottom, this.ID, "bottom")
                    tiles[y1][x1 + 1].free()
                    this.position = "vertical"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
            // RIGHT
            if (direction == "right") {
                if (tiles[y1 - 1][x1].isFree()) {
                    y2 = y1 - 1
                    this.coords.y2 = this.coords.y1 - 1
                    this.coords.x2 = this.coords.x1
                    this.colorBottom = this.colorRight
                    this.colorTop = this.colorLeft
                    tiles[y1][x1].modify(this.colorBottom, this.ID, "bottom")
                    tiles[y2][x1].modify(this.colorTop, this.ID, "top")
                    tiles[y1][x1 + 1].free()
                    this.position = "vertical"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
        }
        // VERTICAL
        if (this.position == "vertical") {
            // LEFT
            if (direction == "left") {
                if (x2 == 8 - 1 && tiles[y1][x1 - 1].isFree()) {
                    this.coords.x1 -= 1
                    this.coords.y2 = this.coords.y1
                    this.colorLeft = this.colorTop
                    this.colorRight = this.colorBottom
                    tiles[y1][x1 - 1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1].modify(this.colorRight, this.ID, "right")
                    tiles[y2][x2].free()
                    this.position = "horizontal"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
                if (tiles[y1][x1 + 1].isFree()) {
                    this.coords.x2 = this.coords.x1 + 1
                    this.coords.y2 = this.coords.y1
                    this.colorLeft = this.colorTop
                    this.colorRight = this.colorBottom
                    tiles[y1][x1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1 + 1].modify(this.colorRight, this.ID, "right")
                    tiles[y2][x1].free()
                    this.position = "horizontal"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }

            // RIGHT
            if (direction == "right") {
                if (x2 == 8 - 1 && tiles[y1][x1 - 1].isFree()) {
                    this.coords.x1 -= 1
                    this.coords.y2 = this.coords.y1
                    this.colorLeft = this.colorBottom
                    this.colorRight = this.colorTop
                    tiles[y1][x1 - 1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1].modify(this.colorRight, this.ID, "right")
                    tiles[y2][x2].free()
                    this.position = "horizontal"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
                if (tiles[y1][x1 + 1].isFree()) {
                    this.coords.x2 = this.coords.x1 + 1
                    this.coords.y2 = this.coords.y1
                    this.colorLeft = this.colorBottom
                    this.colorRight = this.colorTop
                    tiles[y1][x1].modify(this.colorLeft, this.ID, "left")
                    tiles[y1][x1 + 1].modify(this.colorRight, this.ID, "right")
                    tiles[y2][x1].free()
                    this.position = "horizontal"
                    refreshBoard(boardTiles, bckgTiles)
                    return;
                }
            }
        }
    }
    modify = (strike, tiles) => {
        if (this.position == "horizontal") {
            // CHECK LEFT SIDE
            if (this.coords.x1 == strike.x && this.coords.y1 == strike.y) {
                this.colorLeft = "white"
                this.color = this.colorRight
                this.isSingle = true
                this.coords.x1 = this.coords.x2

                tiles[this.coords.y1][this.coords.x1].isSingle = true;
            }
            // CHECK RIGHT SIDE
            if (this.coords.x2 == strike.x && this.coords.y2 == strike.y) {
                this.colorRight = "white"
                this.color = this.colorLeft
                this.isSingle = true
                this.coords.x2 = this.coords.x1

                tiles[this.coords.y1][this.coords.x1].isSingle = true;
            }
            // CHECK IF PILL IS ALL WHITE
            if (this.colorLeft == "white" && this.colorRight == "white") {
                // RETURN SELF ID TO REMOVE IT FORM PILLS ARRAY
                return this.ID;
            }
        }
        // VERTICAL
        if (this.position == "vertical") {
            // CHECK BOTTOM
            if (this.coords.x1 == strike.x && this.coords.y1 == strike.y) {
                this.colorBottom = "white"
                this.color = this.colorTop
                this.isSingle = true
                this.coords.y1 = this.coords.y2

                tiles[this.coords.y1][this.coords.x1].isSingle = true;
            }
            // CHECK TOP
            if (this.coords.x1 == strike.x && this.coords.y2 == strike.y) {
                this.colorTop = "white"
                this.color = this.colorBottom
                this.isSingle = true
                this.coords.y2 = this.coords.y1

                tiles[this.coords.y1][this.coords.x1].isSingle = true;
            }
            // CHECK IF PILL IS ALL WHITE
            if (this.colorBottom == "white" && this.colorTop == "white") {
                // RETURN SELF ID TO REMOVE IT FORM PILLS ARRAY
                return this.ID;
            }
        }
        return false;
    }
    canFall = (tiles) => {
        // SINGLE OR VERTICAL 
        if (this.isSingle || this.position == "vertical") {
            if (this.coords.y1 == 15) return false
            if (tiles[this.coords.y1 + 1][this.coords.x1].isFree()) {
                return true
            }
        }
        // HORIZONTAL
        if (this.position == "horizontal") {
            if (this.coords.y1 == 15 && this.coords.y2 == 15) return false
            if (tiles[this.coords.y1 + 1][this.coords.x1].isFree() && tiles[this.coords.y1 + 1][this.coords.x2].isFree()) return true
        }
        return false
    }
}