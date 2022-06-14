const { exec } = require('child_process')
const { graphics } = require('systeminformation')
const { NodeAudioVolumeMixer } = require('node-audio-volume-mixer')
const { HKEY, RegistryValueType, enumerateValues, setValue } = require('registry-js')
const { ipcRenderer } = require('electron')
const { DateTime } = require('luxon')

const rate = 1
const watingTime = 275
const timeSync = 'time-sync'
const calendarControl = 'calendar-control'

const receive = (channel, listener) => ipcRenderer.on(channel, listener)
const refer = (channel, ...args) => ipcRenderer.send(channel || process.env.global, args)
const cmd = (...arg) => refer(null, ...arg)
const wst = (...scripts) => {
    for (let i = 0; i < scripts.length; i++)
        scripts[i] = 'write-scripts "' + scripts[i] + '"'
    return scripts
}

const query = selector => document.querySelector(selector)
const text = (selector, content) => query(selector).textContent = content
const event = (selector, type, listener) => query(selector).addEventListener(type, listener)
const press = (selector, listener, downListener) => {
    if (listener) query(selector).addEventListener('mouseup', listener)
    if (downListener) query(selector).addEventListener('mousedown', downListener)
}
const overed = (selector, listener, leaveListener) => {
    if (listener) query(selector).addEventListener('mouseenter', listener)
    if (leaveListener) query(selector).addEventListener('mouseleave', leaveListener)
}

const translate = (t, i) => JSON.parse(process.env.i18n)[i][t]

const sliderBounds = (t, p) => [p - 15 + ((100 - p) * ((100 / t) * 16 / 100)), 100 - p - 4.2 - ((100 - p) * ((100 / t) * 16 / 100))]

const date = (t = new Date()) => [t.getFullYear(), t.getMonth() + 1, t.getDate()]
const monthCalc = (t, d) => { if (d[0] > 0) { if (t > 0) { if (d[1] >= 12) { d[1] = 1; d[0]++ } else d[1]++; return d } else if (t < 0) { if (d[1] - 1 <= 0) { d[1] = 12; d[0]-- } else d[1]--; return d }} return d }
const calendarForm = t => {
    ;((t, d, p) => {
        const f = (g, p) => {
            const n20 = index => index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th` 
            return [(function() {
                const e = document.createElement('div')
                const s = DateTime.fromISO
                const d = {
                    sunday: s('0000-01-02'),
                    monday: s('0000-01-03'),
                    tuesday: s('0000-01-04'),
                    wednesday: s('0000-01-05'),
                    thursday: s('0000-01-06'),
                    friday: s('0000-01-07'),
                    saturday: s('0000-01-01')
                }
                const r = Object.entries(d)
                for (var i = 0; i < r.length; i++) {
                    const [k, v] = r[i]
                    const n = document.createElement('span')
                    n.textContent = v.setLocale(g[63]).toFormat('ccccc')
                    n.id = k
                    e.appendChild(n)
                }
                e.classList.add(...g[78][6].split(/\s/))
                return e
            })(), ((function() {
                const e = document.createElement('div')
                for (var i = 0; i < p.length; i++) {
                    const a = p[i],
                    r = document.createElement('div')
                    r.id = `week-of-${n20(i)}`
                    for (var d = 0; d < a.length; d++) {
                        const t = a[d]
                        const l = DateTime.local(t.c.year, t.c.month, t.c.day, t.c.hour, t.c.minute, t.c.second)
                        const n = document.createElement('div')
                        const s = document.createElement('span')
                        n.id - l.toFormat('cccc')
                        if (l.toFormat('yyyyLLdd') === DateTime.local().setLocale(g[63]).toFormat('yyyyLLdd')) {
                            n.setAttribute('selected', '')
                            n.setAttribute('isToday', 'true')
                        }
                        if (p[2][3].c.month !== parseInt(l.toFormat('L')))
                            n.classList.add(parseInt(l.toFormat('d')) > 15 ? 'previous-month' : 'next-month')   
                        s.textContent = l.toFormat('dd')
                        n.appendChild(s)
                        r.appendChild(n)
                    }
                    e.appendChild(r)
                }
                e.classList.add(...g[78][1].split(/\s/))
                return e
            })()), f => {
                const c = p[2][3].c
                return DateTime.local(c.year, c.month, c.day, c.hour, c.minute, c.second).setLocale(g[63]).toFormat(f)
            }, f=> DateTime.local().setLocale(g[63]).toFormat(f)]
        }, w = f(p, d)
        while (query(t[0]).firstChild) query(t[0]).firstChild.remove()
        for (var i = 0; i < 2; i++) query(t[0]).appendChild(w[i])
        query(t[1][1]).textContent = w[2](DateTime.local().setLocale(p[63]).toFormat('yyyy') !== w[2]('yyyy') ? 'LLLL, yyyy' : 'LLLL')
        query(t[1][0]).textContent = w[3]('cccc')
        query(t[1][2]).textContent = w[3]('DD')
    })(t[0], JSON.parse(Buffer.from(t[1], 'base64').toString('utf8')), JSON.parse(Buffer.from(t[2], 'base64').toString('utf8')))
}

const master = n => !isNaN(n) ? NodeAudioVolumeMixer.setMasterVolumeLevelScalar(Number(n / 100)) : typeof n === 'boolean' ? NodeAudioVolumeMixer.muteMaster(Boolean(n)) : Math.round(NodeAudioVolumeMixer.getMasterVolumeLevelScalar() * 100)
const session = (t, n) => !t ? null : (s => !isNaN(n) ? NodeAudioVolumeMixer.setAudioSessionVolumeLevelScalar(s.pid, Number(n / 100)) : typeof n === 'boolean' ? NodeAudioVolumeMixer.setAudioSessionMute(s.pid, Boolean(n)) : Math.round(NodeAudioVolumeMixer.getAudioSessionVolumeLevelScalar(s.pid) * 100))(NodeAudioVolumeMixer.getAudioSessionProcesses().find(f => f.name === !/\.exe$/.test(t) ? t += '.exe' : t))

window.onload = _ => {
    cmd(...wst(
        `var __a = document.body`,
        `var __b = document.querySelector('#top')`,
        `var __c = document.querySelector('#date')`,
        `var __d = document.querySelector('#start')`,
        `var __e = document.querySelector('#menu')`,
        `var __f = document.querySelector('#calendar')`,
        `var __g = document.querySelector('#system')`,
        `var __h = false, __i = false , __j = false`,
        `var __k = document.createElement('style')`,
        `var __l = document.querySelector('#volume')`,
        `var __m = document.querySelector('#volume-help')`,
        `var __n = document.querySelector('#volume-state')`,
        `var __o = document.createElement('style')`,
        `var __p = document.querySelector('#bright')`,
        `var __q = document.querySelector('#bright-help')`,
        `var __r = document.querySelector('#bright-state')`,
        `var __s = 0, __t = document.querySelector('#settings>figure'), __u = null`,
    ))

    setTimeout(_ => cmd(...wst(`__a.classList.remove('ff--lrvqeq')`)), 1250)

    setInterval(() => {
        text('#menu-startup>span',  enumerateValues(HKEY.HKEY_CURRENT_USER,
                'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run')
            .find(v => v.name === 'fluffit.at')
            ? translate('menu.startup.disable', navigator.language)
            : translate('menu.startup.enable', navigator.language))
        text('#menu-close>span', translate('menu.close', navigator.language))
        text('#settings>span', translate('system.settings', navigator.language))
        text('#lock>span', translate('system.lock', navigator.language))
        text('#suspend>span', translate('system.power.suspend', navigator.language))
        text('#restart>span', translate('system.power.restart', navigator.language))
        text('#hardware-shutdown>span', translate('system.power.shutdown', navigator.language))
        text('#logout>span', translate('system.power.logoff', navigator.language))
    }, _[604])

    graphics().then(d => {
        for (let i = 0; i < d.displays.length; i++) {
            if (d.displays[i].main) {
                let p = d.displays[i]
                cmd(...wst(
                    `__a.style.setProperty('--primary-display-width', '${p.currentResX}px')`,
                    `__a.style.setProperty('--primary-display-height', '${p.currentResY}px')`,
                    `__a.style.setProperty('--dock-height', '27px')`,
                    `__a.style.setProperty('--calendar-width', \`\${__f.clientWidth}px\`)"`))}}})

    event('#top', 'contextmenu', _ => cmd(...wst(
        `__e.classList.remove('ff--miu0pc')`,
        `__e.focus()`,
        `__a.style.setProperty('--context-x', '${parseInt(/(\d+)(pt|px|pc|em|rem|vw|vh|vmin|vmax|%)/.exec(query('body').style.getPropertyValue('--primary-display-width'))[1]) < _.x + query('#menu').clientWidth ? _.x - query('#menu').clientWidth : _.x}px')`,
        `__a.style.setProperty('--context-y', '${_.y}px')`)))
    event('#menu', 'blur', _ => cmd(...wst(`__e.classList.add('ff--miu0pc')`)))

    event('#menu-startup', 'click', _ => {
        enumerateValues(HKEY.HKEY_CURRENT_USER, 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run').find(v => v.name === process.env.at)
        ? exec(`REG DELETE "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${process.env.at}" /f`)
        : setValue(HKEY.HKEY_CURRENT_USER, 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', 'fluffit.at', RegistryValueType.REG_SZ, process.env.exepath)
    })
    event('#menu-close', 'click', _ => close())

    setInterval(_ => cmd(`set-channel ${timeSync} || get-index 7426 ${navigator.language} "ccc dd HH:mm" 0`), 10)
    receive(timeSync, (_, d) => cmd(...wst(`document.querySelector('#date').textContent = '${d}'`)))
    
    let month = monthCalc(0, date())

    event('#date', 'click', _ => cmd(...wst(`if (!__h) { __f.classList.remove('ff--miu0pc'); __f.focus(); __h = true }`)))
    event('#calendar', 'blur', _ => cmd(...wst(`if (__h) { __f.classList.add('ff--miu0pc'); setTimeout(_ => { __h = false }, ${watingTime}) }`)))
    event('#calendar', 'mousewheel', e => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(0 < e.deltaY ? 1 : -1, month).join(' ')}`))

    cmd(`set-channel ${calendarControl} || get-index 4561 ${month.join(' ')}`)
    event('#previous-calendar', 'click', _ => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(-1, month).join(' ')}`))
    event('#next-calendar', 'click', _ => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(1, month).join(' ')}`))
    
    receive(calendarControl, (_, d) => {
        var b = { 63: navigator.language, 78: { 6: 'ff--uydj6d ff--wk5zo1', 1: 'ff--keskh8 ff--dy4sas' }}
        calendarForm([['#calendar-mini',
            ['#calendar-week', '#calendar-month', '#calendar-current']],
            Buffer.from(JSON.stringify(d), 'utf8').toString('base64'), 
            Buffer.from(JSON.stringify(b), 'utf8').toString('base64')])
    })

    event('#start', 'click', _ => cmd(...wst(`if (!__i) { __g.classList.remove('ff--miu0pc'); __g.focus(); __i = true }`)))
    event('#system', 'blur', _ => cmd(...wst(`if (__i && !__j) { __g.classList.add('ff--miu0pc'); setTimeout(_ => { __i = false }, ${watingTime}) }`)))

    overed('#volume', _ => cmd(...wst(`__j = true`)), _ => cmd(...wst(`__j = false`, `__g.focus()`)))
    overed('#bright', _ => cmd(...wst(`__j = true`)), _ => cmd(...wst(`__j = false`, `__g.focus()`)))

    const volumeSlider = sliderBounds(query('#volume').clientWidth, master())
    const brightSlider = sliderBounds(query('#bright').clientWidth, 100)

    cmd(...wst(
        `__l.appendChild(__k)`,
        `__p.appendChild(__o)`,
        `__k.textContent = '#volume::before { width: ${volumeSlider[0]}% } #volume::after { width: ${volumeSlider[1]}% }'`,
        `__o.textContent = '#bright::before { width: ${brightSlider[0]}% } #bright::after { width: ${brightSlider[1]}% }'`,
        `__l.value = ${master()}; __m.textContent = '${master()}%'`,
        `__p.value = 100; __q.textContent = '100%'`))

    overed('#volume', _ => {
        setInterval(_ => {
            const { clientWidth, value } = query('#volume')
            const slider = sliderBounds(clientWidth, master())
            master(parseInt(value))
            cmd(...wst(
                `__m.textContent = '${value}%'`,
                `__k.textContent = '#volume::before { width: ${slider[0]}% } #volume::after { width: ${slider[1]}% }'"`)) /* Fixed 210 pixels on system element */
            value <= 0 ? cmd(...wst(`__n.setAttribute('index', 0)`))
            : value < 21 ? cmd(...wst(`__n.setAttribute('index', 1)`))
            : value < 66 ? cmd(...wst(`__n.setAttribute('index', 2)`))
            : cmd(...wst(`__n.setAttribute('index', 3)`))
        }, rate)
    })

    press('#volume', _ => cmd(...wst(`__m.classList.add('ff--miu0pc')`)), _ => cmd(...wst(`__m.classList.remove('ff--miu0pc')`)))
    overed('#settings', _ => cmd(...wst(`__u = setInterval(_ => { __s += 2; __t.style.setProperty('transform', \`rotateZ(\${__s}deg)\`) }, 1)`)), _ => cmd(...wst(`clearInterval(__u)`)))

    event('#settings', 'click', _ => exec('start ms-settings:'))
    event('#lock', 'click', _ => exec('start %WINDIR%\\System32\\rundll32.exe user32.dll,LockWorkStation'))
    event('#suspend', 'click', _ => exec('start %WINDIR%\\System32\\rundll32.exe powrprof.dll,SetSuspendState 0,1,0'))
    event('#restart', 'click', _ => exec('start shutdown /r /f /t 0'))
    event('#hardware-shutdown', 'click', _ => exec('start shutdown /s /f /t 0'))
    event('#logout', 'click', _ => exec('start shutdown /l /f /t 0'))
}