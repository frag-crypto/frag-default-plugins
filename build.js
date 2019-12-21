const babel = require('rollup-plugin-babel')
// const eslint = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify').uglify
const commonjs = require('rollup-plugin-commonjs')
const progress = require('rollup-plugin-progress')
const path = require('path')
const alias = require('rollup-plugin-alias')
const rollup = require('rollup')

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

// const generateES5BuildConfig = (files, options) => {
//     return files.map(file => generateRollupConfig(file, options))
// }

// const thing = [{
//     input: './src/js/index.es6',
//     output: {
//         name: 'main', // for external calls (need exports)
//         file: 'dist/js/index.min.js',
//         format: 'iife' // umd
//     },
//     plugins: pluginOptions
// },
// {
//     // ... // for multi entrypoints
// }]



const generateForPlugins = () => {
    const config = [
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
        }
    ].map(file => {
        return generateRollupConfig(path.join(__dirname, file.in), path.join(__dirname, file.out))
    })
    
    config.forEach(async file => {
        const bundle = await rollup.rollup(file.inputOptions);

        // console.log(bundle.watchFiles); // an array of file names this bundle depends on

        // generate code
        const { output } = await bundle.generate(file.outputOptions);

        for (const chunkOrAsset of output) {
            if (chunkOrAsset.type === 'asset') {
                // console.log('Asset', chunkOrAsset);
            } else {
                // console.log('Chunk', chunkOrAsset.modules);
            }
        }

        // or write the bundle to disk
        await bundle.write(file.outputOptions);
    })
}
module.exports = generateForPlugins
