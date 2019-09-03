const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

parentEpml.ready().then(() => {
    console.log('I\'m the wallet plugin...and my parent is ready :)')

    parentEpml.subscribe('logged_in', (data) => {
        console.log('"logged_in stream" in wallet plugin', data)
    })

    // parentEpml.request('registerUrl', {
    //     url: 'chat',
    //     page: 'rocket-chat/index.html',
    //     title: 'Chat',
    //     icon: 'message',
    //     menus: [],
    //     parent: false
    // })
})