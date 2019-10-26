const path = require('path')

const plugins = [
    // {
    //     folder: path.join(__dirname, 'plugins/chat')
    // },
    {
        folder: path.join(__dirname, 'plugins/core'),
        name: 'core'
    },
    // {
    //     folder: path.join(__dirname, 'plugins/rocket-chat')
    // },
    {
        folder: path.join(__dirname, 'plugins/wallet'),
        name: 'wallet'
    }
]

module.exports = plugins