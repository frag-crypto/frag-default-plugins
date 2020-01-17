const path = require('path')
// const generateForPlugins = require('./build.js')
const build = require('./build.js')
const watch = require('./watch.js')

const plugins = [
    // {
    //     folder: path.join(__dirname, 'plugins/chat')
    // },
    {
        folder: path.join(__dirname, 'plugins/core'),
        name: 'core' // domain name
    },
    // {
    //     folder: path.join(__dirname, 'plugins/rocket-chat')
    // },
    {
        folder: path.join(__dirname, 'plugins/wallet'),
        name: 'wallet'
    }
]

module.exports = {
    plugins,
    // generateForPlugins,
    watch,
    build
}
