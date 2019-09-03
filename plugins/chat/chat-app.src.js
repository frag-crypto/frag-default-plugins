import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

/* Just a copy paste for setting up elements :) */
import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../src/epml.js'
// import io from './socket.io.js'

import '@polymer/paper-icon-button/paper-icon-button-light.js'
import '@polymer/paper-input/paper-input.js'
import '@polymer/iron-icons/iron-icons.js'
import '@polymer/iron-icon/iron-icon.js'

// const serverUrl = '127.0.0.1:3000'
// const serverUrl = '192.168.43.19:3000'
// const serverPort = '3000'
const serverPort = window.location.port

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

parentEpml.imReady()

class ChatApp extends LitElement {
    static get properties () {
        return {
            username: { type: String },
            messages: { type: Array },
            sending: { type: Boolean }
        }
    }

    static get styles () {
        return css`
            #chat {
                display: flex;
                height: 100vh;
                flex-direction:column;
            }
            #messages {
                flex-grow:1;
                padding: 12px;
                overflow:auto;
                width:calc(100%-24px);
            }
            .message-container {
                margin-bottom: 8px;
            }
            .message-container.owner {
                text-align: right;
            }
            .message {
                width:auto;
                max-width:70%;
                display: inline-block;
                text-align:left;
                padding: 12px;
                background: #fff;
                border-radius: 5px;
                margin: 4px;
            }
            .message p {
                margin:0;
                color: #333;
            }
            .message-container h3 {
                margin: 2px 8px;
                font-size:12px;
                color: #666;
                font-family: "Roboto mono", monospace;
            }
            #send-section {
                display:flex;
                flex-direction: row;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                background: #fff;
                padding:12px;
                height:72px;
                min-height:48px;
            }
            #send-section paper-input {
                flex-grow:1;
                padding: 0 12px 0 16px;
                margin-top:-16px;
            }
            #send-section paper-icon-button-light {
                height:48px;
                width:48px;
            }
        `
    }

    constructor () {
        super()

        this.messages = []
        this.sending = false
    }

    render () {
        return html`
            <style>
            
            </style>

            <div id="chat">
                <div id="messages">
                    ${this.messages.map(message => html`
                        <div class="message-container  ${this.username === message.name ? 'owner' : ''}">
                            <div class="message">
                                <p>${message.message}</p>
                            </div>
                            <h3>${message.name}</h3>
                        </div>
                    `)}
                </div>
                <div id="send-section">
                    <!-- <iron-icon src=""></iron-icon> -->
                    <paper-input
                        ?disabled=${this.sending}
                        id="message"
                        @keyup=${e => this._inputKeyup(e)}
                        placeholder="Message"></paper-input>
                    <paper-icon-button-light @click=${() => this.send()}>
                        <button ?disabled=${this.sending} title="heart">
                            <iron-icon icon="icons:send"></iron-icon>
                        </button>
                    </paper-icon-button-light>
                </div>
            </div>
        `
    }

    scrollBottom () {
        const messageDiv = this.shadowRoot.getElementById('messages')
        messageDiv.scrollTop = messageDiv.scrollHeight
    }

    firstUpdated () {
        // eslint-disable-next-line no-undef, new-cap
        this.socket = new io(window.location.hostname + ':' + serverPort)

        parentEpml.subscribe('logged_in', isLoggedIn => {
            if (!isLoggedIn) return

            parentEpml.ready().then(() => parentEpml.request('username').then(username => {
                this.username = username
            }))

            this.socket.on('message', message => {
                console.log(message)
                this.messages = [...this.messages, message]
                setTimeout(() => this.scrollBottom(), 1)
            })

            fetch('http://' + window.location.hostname + ':' + serverPort + '/chat/messages')
                .then(res => res.json())
                .then(messages => {
                    this.messages = messages
                    setTimeout(() => this.scrollBottom(), 1)
                })
        })
    }

    send () {
        const messageElement = this.shadowRoot.getElementById('message')
        const message = messageElement.value.trim()
        if (message.length === 0) return
        this.sending = true
        fetch('http://' + window.location.hostname + ':' + serverPort + '/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: this.username,
                message
            })
        }).then(res => {
            this.sending = false
            // eslint-disable-next-line no-throw-literal
            if (!res.ok) throw 'Unexpected response'
            messageElement.value = ''
            setTimeout(() => messageElement.focus(), 1)
        }).catch(err => {
            this.sending = false
            alert(err)
        })
    }

    _inputKeyup (e) {
        if (e.keyCode === 13) this.send()
    }
}

window.customElements.define('chat-app', ChatApp)
