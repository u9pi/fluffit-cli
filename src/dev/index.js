module['exports'] = (devCallback, use = true) => {
    if (use && process['env']['NODE_ENV'] === 'development') {
        devCallback()
    }
    return use
}