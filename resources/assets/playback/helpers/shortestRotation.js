// Find out which way we should re-rotate so the markers takes
// the shortest path instead of doing a spinning dance every time
const shortestRotation = function (oldAngle = 0, newAngle) {

    let apparentRotation = oldAngle % 360

    if (apparentRotation < 0)
        apparentRotation += 360

    if (apparentRotation < 180 && (newAngle > (apparentRotation + 180)))
        oldAngle -= 360

    if (apparentRotation >= 180 && (newAngle <= (apparentRotation - 180)))
        oldAngle += 360


    oldAngle += (newAngle - apparentRotation)
    return oldAngle;
}

export default shortestRotation
