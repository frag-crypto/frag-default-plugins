const babel = require('rollup-plugin-babel')
// const eslint = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify').uglify
const commonjs = require('rollup-plugin-commonjs')
const progress = require('rollup-plugin-progress')
const path = require('path')
const alias = require('rollup-plugin-alias')

const generateRollupConfig = (inputFile, outputFile) => {
    return {
        inputOptions: {
            input: inputFile,
            plugins: [
                resolve({
                    // jsnext: true
                }),
                alias({
                    entries: {}
                }),
                commonjs(),
                // eslint(),
                progress(),
                babel({
                    exclude: 'node_modules/**'
                })
                // uglify() // only would work if babel is transpiling to es5
            ]
        },
        outputOptions: {
            // name: 'main', // for external calls (need exports)
            // file: 'dist/js/index.min.js',
            file: outputFile,
            format: 'umd', // was umd
            // plugins: pluginOptions,
            // name: 'worker'
        }
    }
}

const generateForPlugins = () => {
    const configs = [
        {
            in: 'plugins/core/main.src.js',
            out: 'plugins/core/main.js'
        },
        {
            in: 'plugins/core/send-money/send-money.src.js',
            out: 'plugins/core/send-money/send-money.js'
        },
        {
            in: 'plugins/core/wallet/wallet-app.src.js',
            out: 'plugins/core/wallet/wallet-app.js'
        },
        {
            in: 'plugins/core/reward-share/reward-share.src.js',
            out: 'plugins/core/reward-share/reward-share.js'
        },
        {
            in: 'plugins/core/node-management/node-management.src.js',
            out: 'plugins/core/node-management/node-management.js'
        }
    ].map(file => {
        return generateRollupConfig(path.join(__dirname, file.in), path.join(__dirname, file.out))
    })

    return configs
}
module.exports = generateForPlugins