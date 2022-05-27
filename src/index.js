const { app, BrowserWindow, dialog, screen, ipcMain, globalShortcut } = require('electron')
const Store = require('electron-store')
const store = new Store()
const path = require('path')
const d = require('./dev')

require('dotenv')['config']()

app['requestSingleInstanceLock']() ? (_ => {
    let browsers = {}, cache = []
    let prfint = null, calint = null, meint = null

    create = ( opts = {
        dist: 2, hf: 2, dohei: 27,
        syswid: 280, syshei: 450,
        calwid: 326, calhei: 420,
        mewid: 150, mehei: 600,
        setwid: 283, sethei: 362,
    }) => {
        //#region [#] variables
        const display = screen['getPrimaryDisplay'](), autohide = true
        const f = {
            '-null'() {},
            '-l'(t) {
                return t !== '*' ? undefined : {
                    /** Display on console.
                     * @usages deb|...{args: object}
                     */
                    deb(args) { console['log'](...args) },
                    /** Execute the command multiple
                     * @usage multiply|command |> ...{commands}
                     */
                    multiply(dv) {
                        dv = dv['join']('|')
                        const ls = dv['split'](/\|>/)
                        for (let i = 0; i < ls['length']; i++) {
                            const line = ls[i]['replace'](/^\s|\s$/g, '')
                            const args = line['split'](/\|/)
                            f['+bind'](args)
                        }
                    },
                    /** Gets the object's corresponding object.
                     * @usage get|type|process
                     * @type proc, process
                     */
                    get(args) {
                        const type = args[0]
                        return /proc|process/['test'](type) ? (_ => {
                            const p = browsers[args[1]]
                            return !p ? undefined : p
                        })() : undefined
                    },
                    /** Sets the object's corresponding object.
                     * @usage set|type|process|key|value
                     * @type proc, process
                     * @key pos, position, size
                     */
                    set(args) {
                        const type = args[0]
                        return /proc|process/['test'](type) ? (_ => {
                            const p = browsers[args[1]]
                            switch (args[2]) {
                                default: break
                                case 'pos':
                                case 'position':
                                case 'size':
                                    f[`+set@${args[2]}`](p, args[3]['split'](/,/))
                                    break
                            }
                        })() : undefined
                    },
                    /** Sends a message to that process channel.
                     * @usage send|process|channel|variable|value
                     */
                    send(args) {
                        const p = browsers[args[0]]
                        if (p) {
                            p['webContents']['send'](args[1], {
                                var: args[2],
                                value: (typeof args[3] !== 'undefined') ? args[3] : true,
                            })
                        }
                    },
                    /** Open the process.
                     * @usage open|process
                     * @usage open|start|{terminal_command_for_the_os}
                     */
                    open(args) {
                        const target = args[0]
                        return /\*/['test'](target) ? (_ => {
                            const p = this['get'](['proc', args[1]])
                            if (!p['isVisible']()) {
                                p['show']()
                                p['focus']()
                            }
                            return true
                        })() : (_ => {
                            const whitelist = {
                                start: {
                                    name: 'start',
                                    execute(params = []) {
                                        const p = params['join'](' ')
                                        require('child_process')['exec'](`${this['name']} ${p}`)
                                    },
                                },
                            }
                            if (target in whitelist) {
                                whitelist['start']['execute']([args[1]])
                            }
                        })()
                    },
                    /** Imports icons in markup format.
                     * @usage fuicon|process|iconName|flags
                     */
                    fuicon(args) {
                        const name = args[1]['toLowerCase']()['replace'](/\s/, '_')
                        cache['push']({
                            type: 'send',
                            name,
                            value: require('./fluentui/svg-icon')(args[1], args[2]),
                            sender: args[0],
                            channel: 'interact',
                            variable: 'set.icon',
                            selector: `[flu-bind="fuicon|${args['join']('|')}"]`,
                        })
                    },
                    /** Manage and check the system.
                     * @warning sometimes it's dangerous.
                     * @usage sysprop|property|\<type,value>|?process
                     */
                    sysprop(args) {
                        let i = parseInt(args[1])
                        args[0] === 'volume' ? (num => {
                            const wa = require('win-audio')
                            if (!isNaN(num)) wa['speaker']['set'](num)
                            else if (args[1] === '?g') {
                                cache['push']({
                                    type: 'send',
                                    name: `sysprop-${args[0]}`,
                                    value: wa['speaker']['get'](),
                                    sender: args[2],
                                    channel: 'interact',
                                    variable: `set.${args[0]}`,
                                    selector: `[flu-bind="sysprop|${args[0]}|~$"][flu-inp]`,
                                })
                            }
                        })(i)
                        : args[0] === 'bright' ? (num => {
                            if (!isNaN(num)) {
                                require('child_process')['exec']([
                                    'powershell.exe',
                                    ' (Get-WmiObject -Namespace root\\wmi',
                                    ' -Class WmiMonitorBrightnessMethods)',
                                    `.wmisetbrightness(1, ${i})`,
                                ]['join'](''))
                            } else if (args[1] === '?g') {
                                require('child_process')['exec']([
                                    'powershell.exe',
                                    ' Get-Ciminstance -Namespace root\\wmi',
                                    ' -ClassName WmiMonitorBrightness |',
                                    ' select -ExpandProperty CurrentBrightness',
                                ]['join'](''), (_, stdout, stderr) => {
                                    cache['push'](stdout ? {
                                        type: 'send',
                                        name: `sysprop-${args[0]}`,
                                        value: parseInt(stdout),
                                        sender: args[2],
                                        channel: 'interact',
                                        variable: `set.${args[0]}`,
                                        selector: `[flu-bind="sysprop|${args[0]}|~$"][flu-inp]`,
                                    } : {
                                        type: 'send',
                                        name: `sysprop-${args[0]}`,
                                        value: true,
                                        sender: args[2],
                                        channel: 'interact',
                                        variable: `set.${args[0]}.hide`,
                                        selector: `[flu-bind="sysprop|${args[0]}|~$"][flu-inp]`,
                                    })
                                })
                            }
                        })(i) : args[0] === 'flusys' ? (_ => {
                            if (/^\+/['test'](args[1]) && f[args[1]]) {
                                const func = f[args[1]], arrargs = []
                                args['shift'](); args['shift']()
                                //#region in-fn
                                function parse(data) {
                                    if (/^\w+$/['test'](data)) {
                                        return data
                                    } else if (/^\d+$/['test'](data)) {
                                        return parseInt(data)
                                    } else if (/^\d+(\.[\d]+)$/['test'](data)) {
                                        return parseFloat(data)
                                    } else return null
                                }
                                function get(value) {
                                    const [type, data] = value['split'](/:/)
                                    if (/str|string/['test'](type)) {
                                        return parse(data)
                                    } else if (/arr|array/['test'](type)) {
                                        let arr = data['split'](/,/)
                                        for (let i = 0; i < arr['length']; i++)
                                            arr[i] = parse(arr[i])
                                        return arr
                                    } else return null
                                }
                                //#endregion
                                for (let i = 0; i < args['length']; i++)
                                    arrargs['push'](get(args[i]))
                                func(...arrargs)
                            }
                        })() : false
                    },
                    /** Quit the application.
                     * @usage close
                     */
                    close() { app['quit']() },
                }
            },
            '+bind'(args = []) {
                const list = this['-l']('*')
                const cmd = args[0]
                args['shift']()
                var il = list[cmd]
                if (il) list[cmd](args)
            },
            '+set@pos'(proc, pos = []) {
                proc = (typeof proc === 'string') ? f['-l']('*')['get']('proc', proc) : proc
                let [_p_x, _p_y] = pos
                let [_p_w, _p_h] = proc['getSize']()
                _p_x = parseInt(_p_x); _p_y = parseInt(_p_y)
                if (_p_x + _p_w > display['size']['width'])
                    _p_x -= _p_w
                proc['setPosition'](_p_x, _p_y)
            },
            '+set@position'(proc, pos = []) {
                this['+set@pos'](proc, pos)
            },
            '+set@size'(proc, size = []) {
                proc = (typeof proc === 'string') ? browsers[proc] : proc
                if (typeof proc === 'undefined') return
                let [_s_w, _s_h] = size
                _s_w = parseInt(_s_w); _s_h = parseInt(_s_h)
                proc['setSize'](_s_w, _s_h)
            },
            '+set@startup'(autoStart = false) {
                app['setLoginItemSettings']({
                    openAtLogin: autoStart,
                    path: app['getPath']('exe'),
                })
            },
            '+store'(mode = 'get', key, value) {
                if (typeof mode === 'string' && mode['length'] > 0) {
                    return store[mode](key, value)
                }
            },
            '~/o': {
                dock() {
                    setTimeout(_ => {
                        browsers['dock']['show']()
                    }, 1250)
                },
                system() {
                    prfint = prfint === null ? setInterval(_ => {
                        if (!browsers['system']['webContents']['isFocused']()) {
                            if (autohide) {
                                browsers['system']['hide']()
                                prfint = null
                            }
                        }
                    }, 10) : null
                },
                calendar() {
                    calint = calint === null ? setInterval(_ => {
                        if (!browsers['calendar']['webContents']['isFocused']()) {
                            if (autohide) {
                                browsers['calendar']['hide']()
                                browsers['dock']['webContents']['send']('interact', {
                                    var: 'enable.calendar'
                                })
                                calint = null
                            }
                        }
                    }, 10) : null
                },
                menu() {
                    meint = meint === null ? setInterval(_ => {
                        if (!browsers['menu']['webContents']['isFocused']()) {
                            if (autohide) {
                                browsers['menu']['hide']()
                                browsers['dock']['webContents']['send']('interact', {
                                    var: 'enable.menu'
                                })
                                meint = null
                            }
                        }
                    }, 10) : null
                },
                config() {},
                about() {},
            },
            '~w^|akse'(procName = 'dock') {
                browsers[procName]['once']('ready-to-show', f[`~/o`][procName])
            },
        }
        //#endregion
        //#region [*] declare
        browsers = {
            dock: new BrowserWindow({
                title: 'Dock - fluffit',
                backgroundColor: '#00000000',
                x: 0,
                y: 0,
                width: display['bounds']['width'],
                height: opts['dohei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: false,
                resizable: false,
                maximizable: false,
                skipTaskbar: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/dock.js'),
                    contextIsolation: false,
                    nodeIntegration: true,
                },
            }),
            system: new BrowserWindow({
                title: 'System - fluffit',
                x: display['bounds']['width'] - opts['syswid'] - opts['dist'],
                y: opts['dohei'] + opts['dist'],
                width: opts['syswid'],
                height: opts['syshei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: false,
                resizable: false,
                maximizable: false,
                skipTaskbar: true,
                alwaysOnTop: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/system.js'),
                },
            }),
            calendar: new BrowserWindow({
                title: 'Calendar - fluffit',
                x: (display['bounds']['width'] / opts['hf']) - (opts['calwid'] / opts['hf']),
                y: opts['dohei'] + opts['dist'],
                width: opts['calwid'],
                height: opts['calhei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: false,
                resizable: false,
                maximizable: false,
                skipTaskbar: true,
                alwaysOnTop: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/calendar.js'),
                },
            }),
            menu: new BrowserWindow({
                title: 'Menu - fluffit',
                x: opts['dist'],
                y: opts['dohei'] + opts['dist'],
                width: opts['mewid'],
                height: opts['mehei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: false,
                resizable: false,
                maximizable: false,
                skipTaskbar: true,
                alwaysOnTop: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/menu.js'),
                },
            }),
            config: new BrowserWindow({
                title: 'Configuration - fluffit',
                x: (display['workAreaSize']['width'] / 2) - (opts['setwid'] / 2),
                y: (display['workAreaSize']['height'] / 2) - (opts['sethei'] / 2) + (opts['dohei'] / 2),
                width: opts['setwid'],
                height: opts['sethei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: true,
                resizable: false,
                maximizable: false,
                skipTaskbar: false,
                alwaysOnTop: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/menu.js'),
                },
            }),
            about: new BrowserWindow({
                title: 'About - fluffit',
                x: (display['workAreaSize']['width'] / 2) - (opts['setwid'] / 2),
                y: (display['workAreaSize']['height'] / 2) - (opts['sethei'] / 2) + (opts['dohei'] / 2),
                width: opts['setwid'],
                height: opts['sethei'],
                frame: false,
                titleBarStyle: 'hidden',
                transparent: true,
                movable: true,
                resizable: false,
                maximizable: false,
                skipTaskbar: false,
                alwaysOnTop: true,
                show: false,
                icon: path['join'](path['parse'](__dirname)['dir'], 'public/icons/app/64x64.png'),
                webPreferences: {
                    devTools: d(() => {}),
                    preload: path['join'](__dirname, 'preload/menu.js'),
                },
            }),
        }
        //#endregion
        //#region [+] load file from src/markup
        ;(mupath => {
            const entry = Object['entries'](browsers)
            for (let i = 0; i < entry['length']; i++) {
                const [name, _] = entry[i]
                browsers[name]['loadFile'](path['join'](mupath, `${name}.html`))
                f['~w^|akse'](name)
            }
        })(path['join'](__dirname, 'markup'))
        //#endregion
        //#region [#] foundate
        ipcMain['on']('interact', (_, p) => {
            const params = p
            let func = '-null', args = []
            for (let i = 0; i < params['length']; i++) {
                func = (p[i]['name'] === 'flu-run' || params[i]['name'] === 'flu-btn')
                ? params[i]['value'] : func
                params[i]['name'] === 'flu-bind' ? (_ => {
                    let value = params[i]['value']
                    value = value['replace'](/^\s|\s$/g, '')
                    args['push'](...value['split'](/\|/g))
                })() : false
            }
            f[func](args)
        })
        //#endregion
        
        //#region etc
        f['+set@startup'](f['+store']('get', 'startup-flu', false))

        // override error dialog
        ;(func => {
            dialog['showErrorBox'] = func
        })(_ => {})
        //#endregion
    }
    
    app['disableHardwareAcceleration']()
    
    app['whenReady']()['then'](() => {
        globalShortcut['register']('F11', _ => {})
        globalShortcut['register']('Control+Shift+I', _ => {})
        globalShortcut['register']('Meta+Esc', _ => {
            !browsers['dock']['isVisible']() ? null
            : browsers['system']['show']()
        })

        ;(window_create => {
            create()
            app['on']('activate', on_mac => {
                BrowserWindow['getAllWindows']()['length'] === 0
                ? create() : window_create || on_mac['preventDefault']()
            })
        })(null)
    })

    app['once']('web-contents-created', _ => {
        let count = 0, g_count = 0
        function retry() {
            setTimeout(_ => {
                cache['length'] === 0 && count < 256 ? retry()
                : cache['length'] > 0 ? (() => {
                    parseCache(cache)
                })() : null
            }, 10); count++
        }
        function parseCache(caches = []) {
            if (g_count > 32) return
            for (let i = 0; i < caches['length']; i++) {
                const x = caches[i]
                const type = x['type']
                if (type === 'send') {
                    const value = x['value'],
                    sender = x['sender'],
                    channel = x['channel'],
                    variable = x['variable'],
                    selector = x['selector']

                    browsers[sender]['webContents']['send'](channel, {
                        var: variable,
                        value: value,
                        selector: selector,
                    })
                }
            }
            g_count++
            retry()
        }
        retry()
    })
    app['once']('will-finish-launching', _ => {
        process['env']['PROOT'] = path['dirname'](require['main']['path'])
        process['env']['LOCALE'] = Intl['DateTimeFormat']()['resolvedOptions']()['locale']
        process['env']['LOCALE'] = 'en'
    })

    app['on']('will-quit', _ => {
        globalShortcut['unregisterAll']()
    })
    app['on']('window-all-closed', _ => {
        if (process['platform'] !== 'darwin') app['quit']()
    })
})() : app['quit']()
