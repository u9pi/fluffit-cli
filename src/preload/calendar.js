const { ipcRenderer } = require('electron')
const { DateTime } = require('luxon')
const { getFluAttrs } = require('../fluffit/attributes')
const cal = require('../calendar')

const locale = process['env']['LOCALE']

const launchTime = DateTime['local']()['setLocale'](locale)
let n = {
    year: launchTime['toFormat']('yyyy'),
    month: launchTime['toFormat']('LL'),
    monthSingle: launchTime['toFormat']('L'),
    monthStr: launchTime['toFormat']('LLLL'),
    weekStr: launchTime['toFormat']('cccc'),
    day: launchTime['toFormat']('dd'),
}, prevDate = '0'

let _y = parseInt(n['year']),
    _m = parseInt(n['monthSingle']),
    _d = parseInt(n['day'])

window['addEventListener']('DOMContentLoaded', _ => {
    //#region Variable
    const fluItems = {
        fluDate: {
            WEEK: document['querySelector']('[flu-fmt="WEEK"]'),
            FULLDATE: document['querySelector']('[flu-fmt="DATE:FULL"]'),
            MONTH: document['querySelector']('[flu-fmt="MONTH"]'),
        },
        fluRun: document['querySelectorAll']('[flu-run]'),
        fluButtons: document['querySelectorAll']('[flu-btn]'),
    }
    //#endregion
    //#region Initialize
    setInterval(_ => {
        const now = DateTime['now'](),
        date = now['toFormat']('dd'),
        year = now['toFormat']('yyyy'),
        month = now['toFormat']('LL'),
        monthStr = now['toFormat']('LLLL'),
        weekStr = now['toFormat']('cccc')
        if (date !== prevDate) {
            prevDate = date
            n['year'] = year
            n['month'] = month
            n['monthStr'] = monthStr
            n['weekStr'] = weekStr
            n['day'] = prevDate
        }
    }, 250)

    fluItems['fluDate']['WEEK']['textContent'] = n['weekStr']
    fluItems['fluDate']['MONTH']['textContent'] = n['monthStr']
    fluItems['fluDate']['FULLDATE']['textContent'] = `${n['monthStr']} ${n['day']} ${n['year']}`
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
                case 'get.calendar':
                    var _gc_obj = (id => {
                        return JSON['stringify']({
                            selector: `[flu-id=${id}]`, year: _y, month: _m, day: _d,
                            date: DateTime['local'](_y, _m, _d)['setLocale'](locale)
                        })
                    })(value)
                    ipcRenderer['send']('interact', [{
                        name: 'flu-run',
                        value: '+bind',
                    }, {
                        name: 'flu-bind',
                        value: `send|calendar|interact|get.calendar.body|${_gc_obj}`,
                    }])
                    break
                case 'get.calendar.previous':
                    var _gc_p_obj = (id => {
                        _m = (ori => {
                            return ori <= 1 ? (_ => {
                                _y--
                                return 12
                            })(_m) : _m - 1
                        })()
                        return JSON['stringify']({
                            selector: `[flu-id=${id}]`, year: _y, month: _m, day: _d,
                            date: DateTime['local'](_y, _m, _d)['setLocale'](locale)
                        })
                    })(value)
                    ipcRenderer['send']('interact', [{
                        name: 'flu-run',
                        value: '+bind',
                    }, {
                        name: 'flu-bind',
                        value: `send|calendar|interact|get.calendar.body|${_gc_p_obj}`,
                    }])
                    break
                case 'get.calendar.next':
                    var _gc_n_obj = (id => {
                        _m = (ori => {
                            return ori >= 12 ? (_ => {
                                _y++
                                return 1
                            })(_m) : _m + 1
                        })(_m)
                        return JSON['stringify']({
                            selector: `[flu-id=${id}]`, year: _y, month: _m, day: _d,
                            date: DateTime['local'](_y, _m, _d)['setLocale'](locale)
                        })
                    })(value)
                    ipcRenderer['send']('interact', [{
                        name: 'flu-run',
                        value: '+bind',
                    }, {
                        name: 'flu-bind',
                        value: `send|calendar|interact|get.calendar.body|${_gc_n_obj}`,
                    }])
                    break
                case 'get.calendar.body':
                    var _gc_b_obj = JSON['parse'](value)
                    var _gc_b_opts = {
                        locale,
                        class: {
                            displayWeeks: 'ff--uydj6d ff--wk5zo1',
                            displayDays: 'ff--keskh8 ff--dy4sas',
                        },
                    }
                    cal['display'](_gc_b_obj['selector'], cal['get'](
                        _gc_b_obj['year'],
                        _gc_b_obj['month'],
                        _gc_b_obj['day']
                    ), _gc_b_opts)
                    fluItems['fluDate']['MONTH']['textContent']
                    = DateTime['local'](
                        _gc_b_obj['year'],
                        _gc_b_obj['month'],
                        _gc_b_obj['day']
                    )['setLocale'](locale)['toFormat']('LLLL')
                    break
            }
        } catch {}
    })
    //#endregion
})