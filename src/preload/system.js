const { ipcRenderer } = require('electron')
const { getFluAttrs } = require('../fluffit/attributes')

window['addEventListener']('DOMContentLoaded', _ => {
    //#region Variable
    const fluItems = {
        fluInput: document['querySelectorAll']('[flu-inp]'),
        fluRun: document['querySelectorAll']('[flu-run]'),
        fluButtons: document['querySelectorAll']('[flu-btn]'),
    }
    //#endregion
    //#region flu-Activities
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
    for (let i = 0; i < fluItems['fluInput']['length']; i++) {
        const inp = fluItems['fluInput'][i],
        run = (e, attrs = null, opts = {
            min: null,
            max: null,
        }) => {
            const attr = attrs || getFluAttrs(inp)
            for (let i = 0; i < attr['length']; i++) {
                const { name, value } = attr[i]
                if (name === 'flu-bind') {
                    attr[i]['value']
                    = value['replace'](/~\$/, inp['value'])
                }
            }
            attr['push']({ name: 'flu-run', value: '+bind' })
            ipcRenderer['send']('interact', attr)
            ipcRenderer['send']('interact', [{
                name: 'flu-run',
                value: '+bind',
            }, {
                name: 'flu-bind',
                value: (_ => {
                    let id = inp['getAttribute']('flu-id'),
                    sel = `input[type=range][flu-id="${id}"].ff--13z8w2`,
                    sv = parseInt(inp['value']),
                    min = opts['min'] || sv - 12 + ((100 - sv) * 0.077),
                    max = opts['max'] || (100 - sv - 4.2) - ((100 - sv) * 0.077),
                    res = `${id};${sel}::before{ width: ${min}% } ${sel}::after{ width: ${max}% }`
                    return `send|system|interact|style.global|${res}`
                })(),
            }])
        }
        inp['addEventListener']('input', run)

        //#region Initialize Slider
        const getValues = (index => {
            if (index[0]['value'] === 'volume') {
                let value = require('win-audio')['speaker']['get']()
                return { 0: index[0]['value'], 1: value }
            } else if (index[0]['value']) {
                return { 0: index[0]['value'], 1: 100 }
            } else return { 0: 'none', 1: 100 }
        })(getFluAttrs(inp)['filter'](f => f['name'] === 'flu-id'))
        run(null, [{ name: 'flu-inp', value: '' },
            { name: 'flu-run', value: '+bind' },
            { name: 'flu-bind', value: `sysprop|${getValues[0]}|${getValues[1]}` },
            { name: 'flu-id', value: getValues[0] }], {
                min: getValues[1] - 12 + ((100 - getValues[1]) * 0.077),
                max: (100 - getValues[1] - 4.2) - ((100 - getValues[1]) * 0.077),
            })
        //#endregion
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
                case 'set.volume':
                case 'set.bright':
                    sel['value'] = value
                    break
                case 'set.bright.hide':
                    var _bright_hide_sel = document['querySelector']('[flu-bind="sysprop|bright|?g|system"]')
                    _bright_hide_sel['style']['display'] = 'none'
                    break
                case 'tlp.toggle':
                    var _tlp_sel = document['querySelector']('[flu-id="tlp"]'),
                    _tlp_c = _tlp_sel['children'][0],
                    _tlp_l = _tlp_c['children']['length'],
                    _tlp_t = _tlp_c['children'][_tlp_l - 1]
    
                    _tlp_sel['getAttribute']('flu-sel') === null ? (_ => {
                        _tlp_sel['setAttribute']('flu-sel', '')
                        if (/FIGURE/['test'](_tlp_t['tagName'])) {
                            while (_tlp_t['hasChildNodes']())
                                _tlp_t['removeChild'](_tlp_t['firstChild'])
                            _tlp_t['innerHTML'] =
                                require('../fluentui/svg-icon')('Caret Down', 'r24')
                        }
                    })() : (_ => {
                        _tlp_sel['removeAttribute']('flu-sel')
                        if (/FIGURE/['test'](_tlp_t['tagName'])) {
                            while (_tlp_t['hasChildNodes']())
                                _tlp_t['removeChild'](_tlp_t['firstChild'])
                            _tlp_t['innerHTML'] =
                                require('../fluentui/svg-icon')('Caret Right', 'r24')
                        }
                    })()
                    break
                case 'style.global':
                    var [_sg_id, _sg_code] = value['split'](/;/)
                    var _sg_sel = document['head']['querySelector'](`style[flu-id="${_sg_id}"]`)
                    var _sg_elem = document['createElement']('style')
                    if (_sg_sel) {
                        var _sg_all_sel = document['head']['querySelectorAll'](`style[flu-id="${_sg_id}"]`)
                        for (var i = 0; i < _sg_all_sel['length']; i++)
                            _sg_all_sel[i]['remove']()
                    }
                    _sg_elem['setAttribute']('for-flu', _sg_id)
                    _sg_elem['innerHTML'] = _sg_code
                    document['head']['appendChild'](_sg_elem)
                    break
            }
        } catch {}
    })
    //#endregion
})