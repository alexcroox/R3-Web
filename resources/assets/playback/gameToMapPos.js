// Converts game position to map position

const gameToMapPos = function (pos, terrainHeight, doubleSize) {

    let convertedX;
    let convertedY;

    if (doubleSize == "1") {

        convertedX = pos.x * 2
        convertedY = Math.abs((pos.y - (terrainHeight / 2)) * 2)

    } else {

        convertedX = pos.x
        convertedY = Math.abs(parseFloat(pos.y) - parseFloat(terrainHeight))
    }

    return [convertedX, convertedY];
}

export default gameToMapPos
