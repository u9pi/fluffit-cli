const path = require('path')
const { merge } = require('webpack-merge')

module.exports = config => {
    config = merge(config, {
        resolve: {
            alias: {
                static: path.resolve(__dirname, 'static'),
            },
        },
    })
    return config
}