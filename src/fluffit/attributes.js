module['exports']['getFluAttrs'] = elem => {
    const _attr = []
    for (let i = 0; i < elem['attributes']['length']; i++) {
        const name = elem['attributes'][i]['name']
        if (/^flu/['test'](name)) {
            _attr['push']({
                name,
                value: elem['attributes'][i]['value'],
            })
        }
    }
    return _attr
}