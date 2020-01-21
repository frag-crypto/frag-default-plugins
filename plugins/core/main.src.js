import { parentEpml, visiblePluginEpml } from './connect.js'
import './streams/streams.js'

// Epml.registerProxyInstance(`core-plugin`, epmlInstance)
// const DHCP_PING_INTERVAL = 1000 * 60 * 10
const DHCP_PING_INTERVAL = 1000 * 10 // 10 seconds
let config = {}
let address
// protocol: 'http',
//     domain: '127.0.0.1',
//         port: 4999,
//             url: '/airdrop/',
//                 dhcpUrl: '/airdrop/ping/'

let haveRegisteredNodeManagement = false

const pingAirdropServer = () => {
    if (!address || !config.coin) return
    const node = config.coin.node.airdrop
    const url = `${node.protocol}://${node.domain}:${node.port}${node.dhcpUrl}${address}`
    fetch(url).then(res => console.log(res))
}

parentEpml.ready().then(() => {
    parentEpml.request('registerUrl', {
        url: 'wallet',
        domain: 'core',
        page: 'wallet/index.html',
        title: 'Wallet',
        // icon: 'credit_card',
        icon: 'account_balance_wallet',
        menus: [],
        parent: false
    })
    parentEpml.request('registerUrl', {
        url: 'send-money',
        domain: 'core',
        page: 'send-money/index.html',
        title: 'Send Money',
        icon: 'send',
        menus: [],
        parent: false
    })
    parentEpml.request('registerUrl', {
        url: 'reward-share',
        domain: 'core',
        page: 'reward-share/index.html',
        title: 'Reward share',
        icon: 'call_split',
        menus: [],
        parent: false
    })
    
    parentEpml.subscribe('config', c => {
        config = JSON.parse(c)
        pingAirdropServer()
        // Only register node management if node management is enabled and it hasn't already been registered
        console.log("==============================")
        console.log(config)
        if (!haveRegisteredNodeManagement && config.user.node.enableManagement) {
            haveRegisteredNodeManagement = true
            parentEpml.request('registerUrl', {
                url: 'node-management',
                domain: 'core',
                page: 'node-management/index.html',
                title: 'Node Management',
                icon: 'cloud',
                menus: [],
                parent: false
            })
        }
    })
    parentEpml.subscribe('selected_address', addr => {
        console.log('RECEIVED SELECTED ADDRESS STREAM')
        address = addr.address
        pingAirdropServer()
    })
})

setInterval(pingAirdropServer, DHCP_PING_INTERVAL)
