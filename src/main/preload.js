const { exec } = require('child_process')
const { NodeAudioVolumeMixer } = require('node-audio-volume-mixer')
const { ipcRenderer } = require('electron')
const { DateTime } = require('luxon')

const rate = 1
const watingTime = 275
const timeSync = 'time-sync'
const calendarControl = 'calendar-control'
const fetchLang = 'fetch-langfile'

const receive = (channel, listener) => ipcRenderer.on(channel, listener)
const refer = (channel, ...args) => ipcRenderer.send(channel || process.env.global, args)
const cmd = (...arg) => refer(null, ...arg)
const wst = (...scripts) => {
    for (let i = 0; i < scripts.length; i++)
        scripts[i] = 'write-scripts "' + scripts[i] + '"'
    return scripts
}

const create = tag => document.createElement(tag)
const createNS = (nURI, tag) => document.createElementNS(nURI, tag)
const query = selector => document.querySelector(selector)
const text = (selector, content) => { try { query(selector).textContent = content } catch (err) { (query('#exception-handle-elem>span') || query('#exception-handle')).textContent = `QueryNotFound${/(\w:)\\([\\\w]+)\\([\w]+.\w+)([\:\d+]+)$/.exec(err.stack)[4]}` }}
const event = (selector, type, listener) => query(selector).addEventListener(type, listener)
const press = (selector, listener, downListener) => {
    if (listener) query(selector).addEventListener('mouseup', listener)
    if (downListener) query(selector).addEventListener('mousedown', downListener)
}
const overed = (selector, listener, leaveListener) => {
    if (listener) query(selector).addEventListener('mouseenter', listener)
    if (leaveListener) query(selector).addEventListener('mouseleave', leaveListener)
}

const translate = (t, i) => { try { return JSON.parse(process.env.i18n)[i][t] } catch { return JSON.parse(process.env.i18n)['en'][t] }}
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

const local = (t, d) => t && d ? (_ => { localStorage.setItem(t, d); return d })() : (t && !d) ? localStorage.getItem(t) : !t && !d ? localStorage : null

const isDev = process.env.NODE_ENV === 'development'
const dev = t => isDev ? t() : undefined

window.onload = _ => {
    let localang = local('STU.FF.GLOBAL.LANG')
    localang = local('STU.FF.GLOBAL.LANG', !localang ? navigator.language : localang)

    dev(_ => {
        const d = document.querySelectorAll('.ff--p0l7s5')
        for (let i = 0; i < d.length; i++) {
            if (d[i].id === 'error') d[i].querySelector('span').textContent = 'Peaceful'
            d[i].classList.remove('ff--miu0pc')
            d[i].classList.remove('ff--p0l7s5')
        }
    })

    cmd(...wst(
        `var body = document.body`,
        `var menu = document.querySelector('#menu')`,
        `var menuPlow = document.querySelector('#menu>div')`,
        `var menuLang = document.querySelector('#menu-language')`,
        `var menuProps = false`,
        `var calendar = document.querySelector('#calendar')`,
        `var calendarState = false`,
        `var system = document.querySelector('#system')`,
        `var systemState = false`,
        `var systemProps = false`,
        `var volume = document.querySelector('#volume')`,
        `var volumeHelp = document.querySelector('#volume-help')`,
        `var volumeState = document.querySelector('#volume-state')`,
        `var volumeStyle = document.createElement('style')`,
        `var bright = document.querySelector('#bright')`,
        `var brightHelp = document.querySelector('#bright-help')`,
        `var brightStyle = document.createElement('style')`,
        `var gear = document.querySelector('#settings>figure'), gearDegree = 0, gearInt = null`,
    ))

    setTimeout(_ => cmd(...wst(`body.classList.remove('ff--lrvqeq')`)), 1250)

    setInterval(() => {
        text('#menu-language>span', translate('menu.lang.select', localang))
        text('#menu-startup>span', translate('menu.startup', localang))
        text('#menu-close>span', translate('menu.close', localang))
        text('#settings>span', translate('system.settings', localang))
        text('#lock>span', translate('system.lock', localang))
        text('#suspend>span', translate('system.power.suspend', localang))
        text('#restart>span', translate('system.power.restart', localang))
        text('#hardware-shutdown>span', translate('system.power.shutdown', localang))
        text('#logout>span', translate('system.power.logoff', localang))
    }, _[604])

    cmd(...wst(
        `body.style.setProperty('--primary-display-width', '${screen.width}px')`,
        `body.style.setProperty('--primary-display-height', '${screen.height}px')`,
        `body.style.setProperty('--dock-height', '27px')`,
        `body.style.setProperty('--calendar-width', \`\${calendar.clientWidth}px\`)"`))

    event('#top', 'contextmenu', _ => cmd(...wst(
        `body.style.setProperty('--context-x', '${parseInt(/(\d+)(pt|px|pc|em|rem|vw|vh|vmin|vmax|%)/.exec(query('body').style.getPropertyValue('--primary-display-width'))[1]) < _.x + query('#menu').clientWidth ? _.x - query('#menu').clientWidth : _.x}px')`,
        `body.style.setProperty('--context-y', '${_.y}px')`,
        `setTimeout(_ => { menu.classList.remove('ff--miu0pc') }, 6)`,
        `menu.focus()`)))
    event('#menu', 'blur', _ => cmd(...wst(`if (!menuProps) { menuPlow.removeAttribute('index'); menu.classList.add('ff--miu0pc') }`)))

    event('#return-menu', 'click', _ => query('#menu>div').removeAttribute('index', 0))
    
    event('#menu-language', 'click', _ => query('#menu>div').setAttribute('index', 0))
    cmd(`set-channel ${fetchLang} || get-index 637 __static/i18n`)
    receive(fetchLang, (_, d) => { const l = Object.entries(d); for (let i = 0; i < l.length; i++) { query('#section-language').appendChild((_ => { const e = create('div'), t = create('span'); t.textContent = l[i][1]['runtime.test.name']; e.classList.add('ff--23qi14', 'ff--0a6crv', 'ff--fluent', 'ff--fluent-ext'); e.appendChild(t); if (localang === l[i][0]) { const f = create('figure'), s = createNS('http://www.w3.org/2000/svg', 'svg'), p = createNS('http://www.w3.org/2000/svg', 'path'); f.style.marginRight = '0.4em'; s.setAttributeNS(null, 'width', 24); s.setAttributeNS(null, 'height', 24); s.setAttributeNS(null, 'viewBox', '0 0 24 24'); p.setAttribute('d', 'm8.5 16.586-3.793-3.793a1 1 0 0 0-1.414 1.414l4.5 4.5a1 1 0 0 0 1.414 0l11-11a1 1 0 0 0-1.414-1.414L8.5 16.586Z'); p.setAttribute('fill', 'none'); s.appendChild(p), f.appendChild(s), e.appendChild(f) } else { e.classList.add('ff--ifv85n'); e.addEventListener('click', _ => { local('STU.FF.GLOBAL.LANG', l[i][0]); location.reload() })} return e })())}})
    
    overed('#menu-startup', _ => cmd(...wst(`menuProps = true`)), _ => cmd(...wst(`menuProps = false`, `menu.focus()`)))
    
    cmd(`set-channel test || get-index 5989 1`)
    receive('test', (_, d) => query('#menu-startup input').checked = d.openAtLogin)
    event('#menu-startup', 'click', _ => query('#menu-startup input').click())
    event('#menu-startup input', 'input', e => cmd(`get-index 5989 1 ${e.target.checked}`))

    event('#menu-close', 'click', _ => close())

    setInterval(_ => cmd(`set-channel ${timeSync} || get-index 7426 ${localang} "ccc dd HH:mm" 0`), 10)
    receive(timeSync, (_, d) => cmd(...wst(`document.querySelector('#date').textContent = '${d}'`)))
    
    let month = monthCalc(0, date())

    event('#date', 'click', _ => cmd(...wst(`if (!calendarState) { calendar.classList.remove('ff--miu0pc'); calendar.focus(); calendarState = true }`)))
    event('#calendar', 'blur', _ => cmd(...wst(`if (calendarState) { calendar.classList.add('ff--miu0pc'); setTimeout(_ => { calendarState = false }, ${watingTime}) }`)))
    event('#calendar', 'mousewheel', e => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(0 < e.deltaY ? 1 : -1, month).join(' ')}`))

    cmd(`set-channel ${calendarControl} || get-index 4561 ${month.join(' ')}`)
    event('#previous-calendar', 'click', _ => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(-1, month).join(' ')}`))
    event('#next-calendar', 'click', _ => cmd(`set-channel ${calendarControl} || get-index 4561 ${monthCalc(1, month).join(' ')}`))
    
    receive(calendarControl, (_, d) => {
        var b = { 63: localang, 78: { 6: 'ff--uydj6d ff--wk5zo1', 1: 'ff--keskh8 ff--dy4sas' }}
        calendarForm([['#calendar-mini',
            ['#calendar-week', '#calendar-month', '#calendar-current']],
            Buffer.from(JSON.stringify(d), 'utf8').toString('base64'), 
            Buffer.from(JSON.stringify(b), 'utf8').toString('base64')])
    })

    event('#start', 'click', _ => cmd(...wst(`if (!systemState) { system.classList.remove('ff--miu0pc'); system.focus(); systemState = true }`)))
    event('#system', 'blur', _ => cmd(...wst(`if (systemState && !systemProps) { system.classList.add('ff--miu0pc'); setTimeout(_ => { systemState = false }, ${watingTime}) }`)))

    overed('#volume', _ => cmd(...wst(`systemProps = true`)), _ => cmd(...wst(`systemProps = false`, `system.focus()`)))
    overed('#bright', _ => cmd(...wst(`systemProps = true`)), _ => cmd(...wst(`systemProps = false`, `system.focus()`)))

    const volumeSlider = sliderBounds(query('#volume').clientWidth, master())
    const brightSlider = sliderBounds(query('#bright').clientWidth, 100)

    cmd(...wst(
        `volume.appendChild(volumeStyle)`,
        `bright.appendChild(brightStyle)`,
        `volumeStyle.textContent = '#volume::before { width: ${volumeSlider[0]}% } #volume::after { width: ${volumeSlider[1]}% }'`,
        `brightStyle.textContent = '#bright::before { width: ${brightSlider[0]}% } #bright::after { width: ${brightSlider[1]}% }'`,
        `volume.value = ${master()}; volumeHelp.textContent = '${master()}%'`,
        `bright.value = 100; brightHelp.textContent = '100%'`))

    overed('#volume', _ => {
        setInterval(_ => {
            const { clientWidth, value } = query('#volume')
            const slider = sliderBounds(clientWidth, master())
            master(parseInt(value))
            cmd(...wst(
                `volumeHelp.textContent = '${value}%'`,
                `volumeStyle.textContent = '#volume::before { width: ${slider[0]}% } #volume::after { width: ${slider[1]}% }'"`)) /* Fixed 210 pixels on system element */
            value <= 0 ? cmd(...wst(`volumeState.setAttribute('index', 0)`))
            : value < 21 ? cmd(...wst(`volumeState.setAttribute('index', 1)`))
            : value < 66 ? cmd(...wst(`volumeState.setAttribute('index', 2)`))
            : cmd(...wst(`volumeState.setAttribute('index', 3)`))
        }, rate)
    })

    press('#volume', _ => cmd(...wst(`volumeHelp.classList.add('ff--miu0pc')`)), _ => cmd(...wst(`volumeHelp.classList.remove('ff--miu0pc')`)))
    overed('#settings', _ => cmd(...wst(`gearInt = setInterval(_ => { gearDegree += 2; gear.style.setProperty('transform', \`rotateZ(\${gearDegree}deg)\`) }, 1)`)), _ => cmd(...wst(`clearInterval(gearInt)`)))

    event('#settings', 'click', _ => exec('start ms-settings:'))
    event('#lock', 'click', _ => exec('start %WINDIR%\\System32\\rundll32.exe user32.dll,LockWorkStation'))
    event('#suspend', 'click', _ => exec('start %WINDIR%\\System32\\rundll32.exe powrprof.dll,SetSuspendState 0,1,0'))
    event('#restart', 'click', _ => exec('start shutdown /r /f /t 0'))
    event('#hardware-shutdown', 'click', _ => exec('start shutdown /s /f /t 0'))
    event('#logout', 'click', _ => exec('start shutdown /l /f /t 0'))
}
