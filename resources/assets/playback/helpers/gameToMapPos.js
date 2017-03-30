import Map from '../map'

// Converts game position to map position
const gameToMapPosX = function (x) {

    return (Map.terrainConfig.doubleSize == "1")? x * 2 : x
}

const gameToMapPosY = function (y) {

    let convertedY;

    if (Map.terrainConfig.doubleSize == "1")
        convertedY = Math.abs((y - (Map.terrainConfig.height / 2)) * 2)
    else
        convertedY = Math.abs(parseFloat(y) - parseFloat(Map.terrainConfig.height))

    return convertedY
}

export { gameToMapPosX, gameToMapPosY }
