const { ipcRenderer } = require('electron')
const { getFluAttrs } = require('../fluffit/attributes')

window['addEventListener']('DOMContentLoaded', _ => {
    //#region Variable
    const fluItems = {
        fluRun: document['querySelectorAll']('[flu-run]'),
        fluButtons: document['querySelectorAll']('[flu-btn]'),
    }
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
            }
        } catch {}
    })
    //#endregion
})