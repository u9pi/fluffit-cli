;((x, __) => {
    __.push(x(require('./utils')))
    __ = __[__.length - 1][298](__)
    
    __[2].config()
    process.env.global = 'ff_global'
    process.env.i18n = __[__.length - 1][3965](`${__static}/i18n`, __[3])
    process.env.exepath = __[1].app.getPath('exe')
    process.env.name = process.env.NODE_ENV === 'development' ? 'electron' : 'fluffit'
    process.env.at = `fluffit.at`

    __[__.length - 1][3595](__[5])
    __[__.length - 1][3595](__[1])

    __[__.length - 1][12517](__[__.length - 1][5736](1), {
        title: 'fluffit', icon: `${__static}/icons/app/64x64.png`,
        backgroundColor: '#00000000', x: 0, y: 0, frame: false, show: false, titleBarStyle: 'hidden', transparent: true,
        movable: false, resizable: false, maximizable: false, skipTaskbar: true,
        webPreferences: { contextIsolation: false, nodeIntegration: true, preload: __[4].join(process.cwd(), process.env.NODE_ENV === 'development' ? 'src/main' : 'resources/app/src/main', 'preload.js') },
    }).then(b => {
        const { width, height } = __[1].screen.getPrimaryDisplay().bounds
        b.setBounds({ width, height })
        b.loadFile(`${__static}/index.html`)
        b.show()

        __[1].ipcMain.on(process.env.global, (l, d) => __[__.length - 1][971](b, process.env.global)[735](__[__.length - 1][2052](d)))
        __[1].dialog.showErrorBox = _ => {}
        
        if (process.env.NODE_ENV === 'development') b.webContents.openDevTools()
    })

})((t, x) => t.execute(...(!x ? [] : x)), [
    require('node-process-windows'),
    require('electron'),
    require('dotenv'),
    require('fs'),
    require('path'),
    require('luxon'),
])