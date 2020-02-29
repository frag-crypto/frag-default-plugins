import { parentEpml } from '../connect.js'
import { EpmlStream } from 'epml'

const BLOCK_CHECK_INTERVAL = 3000 // You should be runn off config.user.nodeSettings.pingInterval...
const BLOCK_CHECK_TIMEOUT = 3000

export const BLOCK_STREAM_NAME = 'new_block'

const onNewBlockFunctions = []

let mostRecentBlock = {
    height: -1
}

export const onNewBlock = newBlockFn => onNewBlockFunctions.push(newBlockFn)

export const check = () => {
    const c = doCheck()
    // CHANGE TO Promise.prototype.finally
    c.then(() => {
        setTimeout(() => check(), BLOCK_CHECK_INTERVAL)
    })
    c.catch(() => {
        setTimeout(() => check(), BLOCK_CHECK_INTERVAL)
    })
}

const doCheck = async () => {
    let timeout = setTimeout(() => {
        throw new Error('Block check timed out')
    }, BLOCK_CHECK_TIMEOUT)

    const block = await parentEpml.request('apiCall', {
        url: '/blocks/last'
    })
    clearTimeout(timeout)
    // console.log(block)
    // const parsedBlock = JSON.parse(block)
    // console.log(parsedBlock, mostRecentBlock)
    if (block.height > mostRecentBlock.height) {
        // console.log('NNEEEWWW BLLOOCCCKKK')
        mostRecentBlock = block
        onNewBlockFunctions.forEach(fn => fn(mostRecentBlock))
    }
}
