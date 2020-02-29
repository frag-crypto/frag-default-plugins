import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { ERROR_CODES } from '../../../src/qora/constants.js'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml'
import '@material/mwc-button'
import '@polymer/paper-input/paper-input.js'
import '@polymer/paper-progress/paper-progress.js'
// import '@polymer/paper-spinner/paper-spinner-lite.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

const coreEpml = new Epml({
    type: 'PROXY',
    source: {
        id: 'visible-plugin',
        target: 'core-plugin',
        proxy: parentEpml
    }
})

class SendMoneyPage extends LitElement {
    static get properties () {
        return {
            addresses: { type: Array },
            amount: { type: Number },
            errorMessage: { type: String },
            sendMoneyLoading: { type: Boolean },
            data: { type: Object },
            addressesInfo: { type: Object },
            selectedAddress: { type: Object },
            selectedAddressInfo: { type: Object },
            addressesUnconfirmedTransactions: { type: Object },
            addressInfoStreams: { type: Object },
            unconfirmedTransactionStreams: { type: Object },
            maxWidth: { type: String },
            recipient: { type: String },
            validAmount: { type: Boolean },
            balance: { type: Number }
        }
    }

    static get observers () {
        return [
            // "_setSelectedAddressInfo(selectedAddress.*, addressesInfo)"
            '_kmxKeyUp(amount)'
        ]
    }

    static get styles () {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }
            #sendMoneyWrapper {
                /* Extra 3px for left border */
                /* overflow: hidden; */
            }

            /* #sendMoneyWrapper>* {
                width: auto !important;
                padding: 0 15px;
            } */

            #sendMoneyWrapper paper-button {
                float: right;
            }

            #sendMoneyWrapper .buttons {
                /* --paper-button-ink-color: var(--paper-green-500);
                    color: var(--paper-green-500); */
                width: auto !important;
            }

            .address-item {
                --paper-item-focused: {
                    background: transparent;
                }
                ;
                --paper-item-focused-before: {
                    opacity: 0;
                }
                ;
            }

            .address-balance {
                font-size: 42px;
                font-weight: 100;
            }

            .show-transactions {
                cursor: pointer;
            }

            .address-icon {
                border-radius: 50%;
                border: 5px solid;
                /*border-left: 4px solid;*/
                padding: 8px;
            }

            paper-input {
                margin: 0;
            }

            .selectedBalance {
                font-size: 14px;
                display: block;
            }

            .selectedBalance .balance {
                font-size: 22px;
                font-weight: 100;
            }
            paper-progress {
                --paper-progress-active-color: var(--mdc-theme-primary)
            }
        `
    }
    render () {
        return html`
            <div id="sendMoneyWrapper" style="width:auto; padding:10px; background: #fff; height:100vh;">
                <div class="layout horizontal center" style=" padding:12px 15px;">
                    <paper-card style="width:100%; max-width:740px;">
                        <div style="background-color: ${this.selectedAddress.color}; margin:0; color: ${this.textColor(this.selectedAddress.textColor)};">

                            <h3 style="margin:0; padding:8px 0;">Send money</h3>

                            <div class="selectedBalance">
                                <!--  style$="color: {{selectedAddress.color}}" -->
                                <span class="balance">${this.balance} qort</span> available for
                                transfer from
                                <span>${this.selectedAddress.address}</span>
                            </div>
                        </div>

                    </paper-card>
                    <paper-input
                        id="amountInput"
                        required
                        label="Amount (qort)"
                        @input=${() => {
                            // console.log('changed')
                            this._checkAmount()
                        }}
                        type="number"
                        auto-validate="false"
                        invalid=${this.validAmount}
                        value="${this.amount}"
                        error-message="Insufficient funds"></paper-input>
                    <paper-input label="To (address or name)" id="recipient" type="text" value="${this.recipient}"></paper-input>
                    <!-- <paper-input label="Fee" type="text" value="{{fee}}"></paper-input> -->
                    
                    <p style="color:red">${this.errorMessage}</p>
                    <p style="color:green;word-break: break-word;">${this.successMessage}</p>
                    
                    ${this.sendMoneyLoading ? html`
                        <paper-progress indeterminate style="width:100%; margin:4px;"></paper-progress>
                        <!-- <paper-spinner-lite></paper-spinner-lite> -->
                    ` : ''}

                    <div class="buttons" >
                        <div>
                            <mwc-button ?disabled=${this.sendMoneyLoading} style="width:100%;" raised autofocus @click=${e => this._sendMoney(e)}>Send &nbsp;
                                <iron-icon icon="send"></iron-icon>
                            </mwc-button>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        `
    }

    _floor (num) {
        return Math.floor(num)
    }

    _checkAmount () {
        const amount = this.shadowRoot.getElementById('amountInput').value
        const balance = this.balance
        // console.log(parseFloat(amount), parseFloat(balance))
        this.validAmount = parseFloat(amount) <= parseFloat(balance)
        // console.log(this.validAmount)
    }

    textColor (color) {
        return color == 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)'
    }

    async _sendMoney (e) {
        const amount = this.shadowRoot.getElementById('amountInput').value // * Math.pow(10, 8)
        let recipient = this.shadowRoot.getElementById('recipient').value
        // var fee = this.fee

        // Check for valid...^

        this.sendMoneyLoading = true

        console.log(this.selectedAddress)
        try {
            let lastRef = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/lastreference/${this.selectedAddress.address}`
            })
            // lastRef = lastRef.data
            console.log(lastRef) // TICK
            // lastRef = JSON.parse(lastRef)
            let recipientAsNameInfo = await parentEpml.request('apiCall', {
                type: 'api',
                url: `names/${recipient}`
                // eslint-disable-next-line handle-callback-err
            })
            // .catch(err => {
            //     return JSON.stringify({})
            // }) //  ...uhhh i dont even know
            // console.log(recipientAsNameInfo)
            console.log(recipientAsNameInfo)
            if (recipientAsNameInfo.success) {
                // Probably not...
                recipientAsNameInfo = recipientAsNameInfo.data // JSON.parse(recipientAsNameInfo.data)
                recipient = recipientAsNameInfo.value
            }

            const txRequestResponse = await parentEpml.request('transaction', {
                type: 2,
                nonce: this.selectedAddress.nonce,
                params: {
                    recipient,
                    amount: amount * Math.pow(10, 8),
                    lastReference: lastRef,
                    fee: 0.001
                }
            })

            console.log(txRequestResponse)
            const responseData = JSON.parse(txRequestResponse) // JSON.parse(txRequestResponse)
            console.log(responseData)
            if (!responseData.reference) {
                if (responseData.success === false) {
                    throw new Error(responseData)
                }
                // ${ERROR_CODES[responseData]}
                if (ERROR_CODES[responseData]) throw new Error(`Error!. Code ${responseData}: ${ERROR_CODES[responseData]}`)
                throw new Error(`Error!. ${responseData}`)
            }

            this.errorMessage = ''
            this.recipient = ''
            this.amount = ''
            this.successMessage = 'Success! ' + txRequestResponse
        } catch (e) {
            console.error(e)
            this.errorMessage = e.message
        }
        this.sendMoneyLoading = false
    }

    updateAccountBalance() {
        clearTimeout(this.updateAccountBalanceTimeout)
        parentEpml.request('apiCall', {
            url: `/addresses/balance/${this.selectedAddress.address}`
        }).then(res => {
            console.log(res)
            this.balance = res
            console.log(this.config.user.nodeSettings.pingInterval)
            this.updateAccountBalanceTimeout = setTimeout(() => this.updateAccountBalance(), this.config.user.nodeSettings.pingInterval ? this.config.user.nodeSettings.pingInterval : 4000)
        })
    }

    constructor () {
        super()
        this.recipient = ''
        this.addresses = []
        this.errorMessage = ''
        this.sendMoneyLoading = false
        this.data = {}
        this.addressesInfo = {}
        this.selectedAddress = {}
        this.selectedAddressInfo = {
            nativeBalance: {
                total: {}
            }
        }
        // computed: '_getSelectedAddressInfo(addressesInfo, selectedAddress)'
        this.addressesUnconfirmedTransactions = {}
        this.addressInfoStreams = {}
        this.unconfirmedTransactionStreams = {}
        this.maxWidth = '600'
        this.amount = 0
        this.validAmount = true

        parentEpml.ready().then(() => {
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                // console.log('==========================SELECTED ADDRESS',selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
                this.selectedAddress = selectedAddress
                const addr = selectedAddress.address

                this.updateAccountBalance()
            })
        })
    }
}

window.customElements.define('send-money-page', SendMoneyPage)
