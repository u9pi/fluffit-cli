const __x = []
let __u = {
    298: t => Array.isArray(t) ? t.sort() : t,
    637: t => {
        const { join, resolve } = require('path')
        const { readdirSync, readFileSync } = require('fs')
        const p = resolve(/__static/.test(t[0]) ? t[0].replace(/__static/, __static) : /__dirname/.test(t[0]) ? t[0].replace(/__dirname/, __dirname) : t[0])
        const d = readdirSync(p)
        const l = {}
        for (let i = 0; i < d.length; i++) {
            const f = {}
            const e = Object.entries(Object.assign({}, Object.entries(JSON.parse(readFileSync(join(p, d[i])))).filter(([k]) => /^runtime\..+/.test(k))))
            for (let i = 0; i < e.length; i++) {
                const [_, v] = e[i]
                f[v[0]] = v[1]
            }
            l[d[i].replace(/([\w_-]+)(\..+)?(\.json)/, '$1')] = f
        }
        return l
    },
    971: (b, c) => {
        const e = {
            735: t => {
                function run(x) {
                    for (let i = 0; i < x.length; i++)
                        e[x[i].shift()](x[i])
                }
                !Array.isArray(t) ?  (_ => {
                    const e = Object.entries(t)
                    for (let i = 0; i < e.length; i++)
                        run(e[i][1])
                })() : run(t)
            },
            'print': t => {
                const l = /debug|error|info|log|warn|time/, s = /-(d|e|i|l|w|t)/
                let medium = console.log, format,
                msg = (t.length >= 2 && l.test(t[0]) || s.test(t[0])) ? (_ => {
                    format = t.shift().toLowerCase()
                    return t
                })() : t
                if (l.test(format)) medium = console[format]
                else if (s.test(format)) {
                    var p = s.exec(format)[1]
                    medium = p === 'd' ? console.debug
                    : p === 'e' ? console.error
                    : p === 'i' ? console.info
                    : p === 'l' ? console.log
                    : p === 'w' ? console.warn
                    : p === 't' ? console.time
                    : console.log
                }
                return medium(...msg)
            },
            'set-channel': t => c = t[0],
            'get-index': t => b.webContents.send(c, __u[t.shift()](t)),
            'write-scripts': t => {
                for (let i = 0; i < t.length; i++)
                    b.webContents.executeJavaScript(t[i])
            },
        }
        return e
    },
    2052: (t) => {
        function parse(x, _ = [], _g = []) {
            const d = x.split(/\|{2}/)
            for (let i = 0; i < d.length; i++) {
                let s = d[i].replace(/^\s|\s$/, '').split(''), a = [], q = false
                for (let i = 0; i < s.length; i++) {
                    if (/["]/.test(s[i])) q = q ? false : true
                    else if (q) a.push(s[i])
                    else if (/\s/.test(s[i])) {
                        _g.push(a.join(''))
                        while (a.length > 0) a.pop()
                    } else if (/./.test(s[i])) a.push(s[i])
                    if (s.length - 1 === i) _g.push(a.join(''))
                }
                _.push(_g)
                _g = []
            }
            return _
        }
        return !Array.isArray(t) ? parse(t) : ((_ = {}) => {
            for (let i = 0; i < t.length; i++)
                _[i] = parse(t[i])
            return _
        })()
    },
    3595: t => __x.push(t),
    3965: (t, f) => JSON.stringify(((b = {}) => {
        f.readdirSync(t).forEach(_ => b[_.replace(/([\w_-]+)(\..+)?(\.json)/, '$1')] = JSON.parse(f.readFileSync(`${t}/${_}`, 'utf8')))
        return b
    })()),
    4561: t => {
        const m = require('luxon').DateTime
        let l = m.local(parseInt(t[0]), parseInt(t[1]), parseInt(t[2])), g = [],
        s = l.endOf('month').endOf('week').diff(l.startOf('month').startOf('week'), 'days').toObject().days
        if (s != null) {
            new Array(Math.round(s)).fill(0).map((_, i) => i).map(d => {
                return l.startOf('month').startOf('week').minus({ days: 1 }).plus({ days: d })
            }).forEach((v, i) => {
                if (i === 0 || (i % 7 === 0 && i > 6)) {
                    g.push([v])
                    return
                }
                g[g.length - 1].push(v)
            })
            g = g.filter(w => { return (w[0].hasSame(l, 'month') || w[w.length - 1].hasSame(l, 'month')) })
        }
        return g
    },
    5736: t => !isNaN(t) ? __x[t] : __x,
    5989: t => {
        if (t[1]) {
            __x[parseInt(t[0])].app.setLoginItemSettings({
                openAtLogin: t[1] === 'true' ? true : false,
                path: __x[parseInt(t[0])].app.getPath('exe'),
            })
        } else {
            return __x[parseInt(t[0])].app.getLoginItemSettings()
        }
    },
    7426: t => __x[parseInt(t[2])].DateTime.now().setLocale(t[0]).toFormat(t[1]),
    12517: (t, p, d) => {
        return new Promise(r => {
            t.app.requestSingleInstanceLock() ? (_ => {
                t.app.whenReady().then(_ => r(new t.BrowserWindow(p)))
                t.app.disableHardwareAcceleration()
                t.app.on('will-quit', _ => t.globalShortcut.unregisterAll())
            })() : t.app.quit()
        })
    },
    14110: t => typeof t === 'function' ? t(__u) : __u,
}
module.exports.execute = __a => __u