import Infantry from '../infantry'
import Playback from '../index'
import _each from 'lodash.foreach'

// Return a string containing driver, crew and vehicle text where applicable
const calculateVehicleLabel = function (driver, crew, cargo, isDead) {

    let label = ' '
    let driverLabel = ''
    let crewLabel = ''
    let cargoLabel = ''

    let highlightUnitClass = 'map__label__vehicle--highlight-unit'

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
            let highlightClass = (crewEntityId == Playback.highlightUnit)? highlightUnitClass : ''
            crewLabel += `
                <span class="map__label map__label__vehicle__crew__unit ${highlightClass}">
                    ${crewEntity.name}
                </span>`
        }
    })

    // Add cargo to the label
    _each(cargo, cargoEntityId => {
        let cargoEntity = Infantry.getEntityById(cargoEntityId)
        let highlightClass = (cargoEntity == Playback.highlightUnit)? highlightUnitClass : ''
        cargoLabel += `
            <span class="map__label map__label__vehicle__cargo__unit ${highlightClass}">
                ${cargoEntity.name}
            </span>`
    })

    if (driverLabel != '') {
        let highlightClass = (driver.entity_id == Playback.highlightUnit)? highlightUnitClass : ''
        label += `
            <span class="map__label map__label__vehicle--driver ${highlightClass}">
                ${driverLabel}
            </span>`
    }

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

    if (label != ' ' && isDead)
        label = `<span class="map__label--is-dead">${label}</span>`

    return label
}

export default calculateVehicleLabel
