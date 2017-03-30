// Find out which way we should re-rotate so the markers takes
// the shortest path instead of doing a spinning dance every time
const shortestRotation = function (oldRotation = 0, new) {

    let oldRotation, apparentRot

    apparentRot = oldRotation % 360

    if (apparentRot < 0)
        apparentRot += 360

    if (apparentRot < 180 && (newRotation > (apparentRot + 180)))
        oldRotation -= 360

    if (apparentRot >= 180 && (newRotation <= (apparentRot - 180)))
        oldRotation += 360


    oldRotation += (newRotation - apparentRot)
    return oldRotation;

}

export default shortestRotation
