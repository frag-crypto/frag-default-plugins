const rollup = require('rollup')

const configs = require('./build-config.js')()

const build = () => {
    configs.forEach(async file => {
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
module.exports = build
