export function checkRowStrikes(width, height, tiles) {
    let colorCounter = 0;
    const rowStrikes = [];
    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            let elementCounter = 0
            if (tiles[j][i].color != "white") {
                let strikes = []
                while (elementCounter < width && colorCounter < width - 1 - i && tiles[j][i].color == tiles[j][i + 1 + colorCounter].color) {
                    colorCounter++
                }
                elementCounter++
                if (colorCounter >= 3) {
                    let xStart = i
                    let xEnd = i + colorCounter
                    for (let xBegin = i; xBegin < i + colorCounter + 1; xBegin++) {
                        strikes.push({
                            y: tiles[j][i].i,
                            x: xBegin
                        })
                    }
                }
                colorCounter = 0
                if (strikes.length > 0) {
                    strikes.forEach((strike) => rowStrikes.push(strike))
                    strikes = []
                }
            }
        }
    }
    return rowStrikes;
}

export function checkColumnStrikes(width, height, tiles) {
    let colorCounter = 0;
    const columnStrikes = [];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let elementCounter = 0
            if (tiles[j][i].color != "white") {
                let strikes = []

                while (elementCounter < height && colorCounter < height - 1 - j && tiles[j][i].color == tiles[j + 1 + colorCounter][i].color) {
                    colorCounter++
                }
                elementCounter++
                if (colorCounter >= 3) {
                    let yStart = j
                    let yEnd = j + colorCounter
                    for (let yBegin = j; yBegin < j + colorCounter + 1; yBegin++) {
                        strikes.push({
                            y: yBegin,
                            x: tiles[j][i].j
                        })
                    }
                }
                colorCounter = 0
                if (strikes.length > 0) {
                    strikes.forEach((strike) => columnStrikes.push(strike))
                    strikes = []
                }
            }
        }
    }
    return columnStrikes;
}