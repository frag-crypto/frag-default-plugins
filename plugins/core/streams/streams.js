import { parentEpml } from '../connect.js'
import { AddressWatcher } from './AddressWatcher.js'
import { UnconfirmedTransactionWatcher } from './UnconfirmedTransactionWatcher.js'

import { onNewBlock, check, BLOCK_STREAM_NAME } from './onNewBlock.js'

const addrWatcher = new AddressWatcher()
const txWatcher = new UnconfirmedTransactionWatcher()

let mostRecentBlock = { height:-1 }

const blockStream = new EpmlStream(BLOCK_STREAM_NAME, () => {
    console.log('WE GOT A SUBSCRIPTION')
    return mostRecentBlock
})

parentEpml.subscribe('logged_in', async isLoggedIn => {
    if (isLoggedIn === 'true') {
        // console.log('"logged_in stream" in core/main.js', isLoggedIn)
        const addresses = await parentEpml.request('addresses')
        const parsedAddresses = addresses // JSON.parse(addresses)
        console.log(parsedAddresses)
        // console.log(parsedAddress)
        addrWatcher.reset()
        parsedAddresses.forEach(addr => addrWatcher.addAddress(addr))
        txWatcher.reset()
        parsedAddresses.forEach(addr => txWatcher.addAddress(addr))
    }
})

onNewBlock(block => {
    console.log('New block', block)
    mostRecentBlock = block
    blockStream.emit(block)
    addrWatcher.testBlock(block)
})
check()
