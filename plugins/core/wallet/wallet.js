import { Epml } from '../../../src/epml.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

parentEpml.ready().then(() => {
    console.log('I\'m the wallet plugin...and my parent is ready :)')

    parentEpml.subscribe('logged_in', (data) => {
        console.log('"logged_in stream" in wallet plugin', data)
    })

    parentEpml.request('registerUrl', {
        url: 'fail',
        page: 'core/fail',
        title: 'Test failure',
        // icon: 'credit_card',
        icon: 'error_outline',
        menus: [],
        parent: false
    })
})