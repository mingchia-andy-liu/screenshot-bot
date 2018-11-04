const hasDoubles = (player) => {
    let count = 0
    const assists = player.ast
    const blocks = player.blk
    const points = player.pts
    const reboundsDefensive = player.dreb
    const reboundsOffensive = player.oreb
    const steals = player.stl

    count += (+reboundsOffensive + +reboundsDefensive) / 10 >= 1 ? 1 : 0
    count += (+points) / 10 >= 1 ? 1 : 0
    count += (+assists) / 10 >= 1 ? 1 : 0
    count += (+steals) / 10 >= 1 ? 1 : 0
    count += (+blocks) / 10 >= 1 ? 1 : 0
    switch (count) {
        case 2:
            return 'dd'
        case 3:
            return 'td'
        case 4:
            return 'qd'
        case 5:
            return 'pd'
        default:
            return ''
    }
}

const formatMinutes = (minutes, seconds) => {
    if (minutes < 10 || minutes.length === 1) {
        minutes = `0${minutes}`
    }
    if (seconds < 10 || seconds.length === 1) {
        seconds = `0${seconds}`
    }
    return `${minutes}:${seconds}`
}

const toPercentage = (decimal) => {
    if (Number.isNaN(decimal)) return '-'
    else return (decimal * 100).toFixed()
}

const winning = (self, other, condition = true) => {
    if (condition && self > other) {
        return 'winning'
    }
    return ''
}

const losing = (self, other, condition = true) => {
    if (condition && self < other) {
        return 'losing'
    }
    return ''
}

const losingWhenMore = (self, other) => {
    if (self > other) {
        return 'losing'
    }
    return ''
}

