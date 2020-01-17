const rollup = require('rollup')

const configs = require('./build-config.js')()

const watch = () => {
    configs.forEach(async file => {
        const watchOptions = {
            ...file.inputOptions,
            // output: [outputOptions],
            output: [file.outputOptions],
            watch: {
                // chokidar,
                // clearScreen,
                // exclude,
                // include
            }
        }

        const watcher = rollup.watch(watchOptions)

        watcher.on('event', event => {
            // event.code can be one of:
            //   START        — the watcher is (re)starting
            //   BUNDLE_START — building an individual bundle
            //   BUNDLE_END   — finished building a bundle
            //   END          — finished building all bundles
            //   ERROR        — encountered an error while bundling
            //   FATAL        — encountered an unrecoverable error
        })

        // stop watching
        // watcher.close()
    })
}

module.exports = watch
