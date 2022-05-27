const { DateTime } = require('luxon')

module['exports']['get'] = (year, month, day) => {
    let weeks = []
    const date = DateTime['local'](year, month, day)
    const { days } = date['endOf']('month')
        ['endOf']('week')
        ['diff'](date['startOf']('month')
            ['startOf']('week'), 'days')
        ['toObject']()
    if (days != null) {
        new Array(Math['round'](days))
            ['fill'](0)
            ['map']((_, i) => i)
            ['map'](day => {
                return date['startOf']('month')
                    ['startOf']('week')
                    ['minus']({ days: 1 })
                    ['plus']({ days: day }) })
            ['forEach']((v, i) => {
                if (i === 0 || (i % 7 === 0 && i > 6)) {
                    weeks['push']([v])
                    return
                }
                weeks[weeks['length'] - 1]['push'](v)
            })
        weeks = weeks['filter'](week => {
            return (
                week[0]['hasSame'](date, 'month') ||
                week[week['length'] - 1]['hasSame'](date, 'month')
            )
        })
    }
    return weeks
}
module['exports']['display'] = require('./display.js')