const { ipcRenderer } = require('electron')
const { DateTime } = require('luxon')
const { getFluAttrs } = require('../fluffit/attributes')
const d = require('../dev')

window['addEventListener']('DOMContentLoaded', _ => {
    //#region Variable
    const locale = process['env']['LOCALE']
    const dateFormat = 'ccc dd HH:mm'
    const intervalDelay = 500

    const format = dateFormat['replace'](/\\n/gi, '<br>')
    const ms = /S+/['test'](dateFormat) ? 1 : intervalDelay
    let prevDate = '0'

    const fluItems = {
        fluBody: document['querySelector']('[flu-body]'),
        fluSystem: document['querySelector']('[flu-system]'),
        fluDate: document['querySelector']('#date>[flu-date]'),
        fluRun: document['querySelectorAll']('[flu-run]'),
        fluButtons: document['querySelectorAll']('[flu-btn]'),
    }
    //#endregion
    //#region Initialize
    setTimeout(_ => { fluItems['fluBody']['classList']['remove']('ff--0gb6c1') }, ms + 350)
    setInterval(_ => {
        const date = DateTime['local']()['toFormat'](format, { locale })
        if (date !== prevDate) {
            prevDate = date
            fluItems['fluDate']['innerHTML'] = prevDate
        }
    }, ms)

    d(() => {
        const c = document['createElement']('span')
        c['innerHTML'] = '<span>fluffit[,LOG]: running on development mode</span>'
        document['querySelector']('#activities')['appendChild'](c)
    })
    //#endregion
    
    //#region Flu-Activities
    for (let i = 0; i < fluItems['fluButtons']['length']; i++) {
        const btn = fluItems['fluButtons'][i]
        btn['addEventListener']('click', _ => {
            ipcRenderer['send']('interact', getFluAttrs(btn))
        })
    }
    for (let i = 0; i <fluItems['fluRun']['length']; i++) {
        const run = fluItems['fluRun'][i]
        ipcRenderer['send']('interact', getFluAttrs(run))
    }
    //#endregion
    //#region IPC
    ipcRenderer['on']('interact', (_, p) => {
        try {
            let sel = document['querySelector'](p['selector'])
            let value = p['value']
            switch (p['var']) {
                default: break
                case 'set.icon':
                    sel['innerHTML'] = value
                    break
                case 'disable.calendar':
                    fluItems['fluDate']['style']['pointerEvents'] = 'none'
                    break
                case 'enable.calendar':
                    fluItems['fluDate']['style']['pointerEvents'] = 'all'
                    break
                case 'disable.system':
                    fluItems['fluSystem']['style']['pointerEvents'] = 'none'
                    break
                case 'disable.system':
                    fluItems['fluSystem']['style']['pointerEvents'] = 'all'
                    break
                case 'enable.menu':
                    var _menu_sel = document['querySelector'](value)
                    _menu_sel['addEventListener']('contextmenu', e => {
                        e['preventDefault']()
                        ipcRenderer['send']('interact', [{
                            name: 'flu-run',
                            value: '+bind',
                        }, {
                            name: 'flu-bind',
                            value: `set|proc|menu|pos|${e['x']},${e['y']} `,
                        }])
                        ipcRenderer['send']('interact', [{
                            name: 'flu-run',
                            value: '+bind',
                        }, {
                            name: 'flu-bind',
                            value: 'open|*|menu',
                        }])
                    })
                    break
            }
        } catch {}
    })
    //#endregion
})