// Covert faction int to string (e.g 0 - west)
const getFactionData = function (factionId) {

    let factionData = {
        "name": "unknown",
        "color": '#CCCCCC'
    }

    factionId = parseInt(factionId)

    switch (factionId) {

        case 0:

            factionData.name = 'east'
            factionData.color = '#ED5C66'
            break

        case 1:

            factionData.name = 'west'
            factionData.color = '#2848E9'
            break

        case 2:

            factionData.name = 'independant'
            factionData.color = '#518245'
            break;

        case 3:
            factionData.name = 'civilian'
            factionData.color = '#7D26CD'
            break;
    }

    return factionData

}

export default getFactionData
