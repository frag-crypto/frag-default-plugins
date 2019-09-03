const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

parentEpml.ready().then(() => {
    parentEpml.subscribe('logged_in', (data) => {
        console.log('"logged_in stream" in wallet plugin', data)
    })

    parentEpml.request('registerUrl', {
        url: 'chat',
        page: 'chat/index.html',
        title: 'Chat',
        icon: 'message',
        menus: [],
        parent: false
    })
})