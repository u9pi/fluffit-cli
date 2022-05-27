const fs = require('fs')
const path = require('path')

const proot = process['env']['PROOT']
const assetsPath = path['join'](proot, 'public/icons/assets')

function get(name, flags) {

    let [shape, size] = flags['replace'](/(^\w)/, '$1,')['split'](/,/)
    shape = shape === 'f' ? 'filled' : 'regular'
    const format = 'ic_fluent_$NAME_$SIZE_$SHAPE.svg'
    const form = format['replace'](/\$NAME/, name['toLowerCase']()['replace'](/\s/, '_'))
        ['replace'](/\$SHAPE/, shape)['replace'](/\$SIZE/, size)

    let fullPath
    const assets = fs['readdirSync'](assetsPath)
    for (let i = 0; i < assets['length']; i++) {
        if (name === assets[i]) {
            const svgDir = path['join'](assetsPath, name, 'SVG')
            const files = fs['readdirSync'](svgDir)
            for (let i = 0; i < files['length']; i++)
                if (files[i] === form)
                    fullPath = path['join'](svgDir, form)
        }
    }
    return fs['readFileSync'](fullPath, { encoding: 'utf8', flag: 'r' })
}
function getAll() {
    return null
}

module['exports'] = (name, flags) => {
    if (name && flags) return get(name, flags)
    else return getAll()
}