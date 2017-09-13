import Infantry from '../infantry'
import _each from 'lodash.foreach'

// Return a string containing driver, crew and vehicle text where applicable
const calculateVehicleLabel = function (driver, crew, cargo) {

    let label = ' '
    let driverLabel = driver.entity_id
    let crewLabel = ''
    let cargoLabel = ''

    // AI driver, players as passengers
    if (
        driver.entity_id != 0 &&
        (driver.player_id == '' || driver.player_id == '_SP_AI_')
        && (crew.length || cargo.length)
    )
        driverLabel = 'AI'

    // Human driver
    if (driver.player_id != "" && driver.player_id != "_SP_AI_")
        driverLabel = driver.name

    // Add crew to the label
    _each(crew, crewEntityId => {
        if (crewEntityId != driver.entity_id) {
            let crewEntity = Infantry.getEntityById(crewEntityId)
            crewLabel += `
                <span class="map__label map__label__vehicle__crew__unit">
                    ${crewEntity.name}
                </span>`
        }
    })

    // Add cargo to the label
    _each(cargo, cargoEntityId => {
        let cargoEntity = Infantry.getEntityById(cargoEntityId)
        cargoLabel += `
            <span class="map__label map__label__vehicle__cargo__unit">
                ${cargoEntity.name}
            </span>`
    })

    if (driverLabel != '')
        label += `
            <span class="map__label map__label__vehicle--driver">
                ${driverLabel}
            </span>`

    if (crewLabel != '')
        label += `
            <span class="map__label__vehicle__crew">
                ${crewLabel}
            </span>`

    if (cargoLabel != '')
        label += `
            <span class="map__label__vehicle__cargo">
                ${cargoLabel}
            </span>`

    return label
}

export default calculateVehicleLabel
