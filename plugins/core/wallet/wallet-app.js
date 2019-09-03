/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
import { Epml } from '../../../src/epml.js'

import '@material/mwc-icon'
import '@polymer/paper-spinner/paper-spinner-lite.js'
// import * as thing from 'time-elements'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

const TX_TYPES = {
    1: 'Genesis',
    2: 'Payment',

    3: 'Name registration',
    4: 'Name update',
    5: 'Sell name',
    6: 'Cancel sell name',
    7: 'Buy name',

    8: 'Create poll',
    9: 'Vote in poll',

    10: 'Arbitrary',

    11: 'Issue asset',
    12: 'Transfer asset',
    13: 'Create asset order',
    14: 'Cancel asset order',
    15: 'Multi-payment transaction',

    16: 'Deploy AT',

    17: 'Message',

    18: 'Delegation',
    19: 'Supernode',
    20: 'Airdrop'
}

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

const coreEpml = new Epml({
    type: 'PROXY',
    source: {
        id: 'visible-plugin',
        target: 'core-plugin',
        proxy: parentEpml
    }
})

class WalletApp extends LitElement {
    static get properties () {
        return {
            loading: { type: Boolean },
            lastAddress: { type: String },
            transactions: { type: Array },
            lastBlock: { type: Object },
            addressesInfo: { type: Object },
            selectedAddress: { type: Object },
            selectedAddressInfo: { type: Object },
            selectedAddressTransactions: { type: Array },
            addressesUnconfirmedTransactions: { type: Object },
            addressInfoStreams: { type: Object },
            unconfirmedTransactionStreams: { type: Object }
        }
    }

    static get styles () {
        return css`
            .red{
                color: var(--paper-red-500);
            }
            .green{
                color: var(--paper-green-500);
            }
            paper-spinner-lite{
                height:75px;
                width:75px;
                --paper-spinner-color: var(--primary-color);
                --paper-spinner-stroke-width: 2px;
            }
            .unconfirmed{
                font-style: italic;
            }
                        .roboto {
                font-family: "Roboto", sans-serif;
            }
            .mono {
                font-family: "Roboto Mono", monospace;
            }
            .weight-100{
                font-weight: 100;
            }
            
            .text-white-primary{
                color: var(--white-primary)
            }
            .text-white-secondary{
                color: var(--white-secondary)
            }
            .text-white-disabled{
                color: var(--white-disabled)
            }
            .text-white-hint{
                color: var(--white-divider)
            }

            table {
                border:none;
            }
            table td, th{
                white-space:nowrap;
                /* padding:10px; */
                text-align:left;
                font-size:14px;
                padding:0 12px;
                font-family: "Roboto", sans-serif;
            }
            table tr {
                height:48px;
            }
            table tr:hover td{
                background:#eee;
            }
            table tr th {
                color: #666;
                font-size:12px;
            }
            table tr td {
                margin:0;
            }
            .white-bg {
                height:100vh;
                background: #fff;
            }
        `
    }

    constructor () {
        super()
        this.lastAddress = ''
        this.transactions = []
        this.lastBlock = {
            height: 0
        }
        this.addressesInfo = {}
        this.selectedAddress = {}
        this.selectedAddressInfo = {
            nativeBalance: {
                total: {}
            },
            transactions: []
        }
        // selectedAddressTransactions: {
        //     value: [],
        //         computed: '_getAllTransactions(selectedAddressInfo.transactions, addressesUnconfirmedTransactions)'
        // },
        this.addressesUnconfirmedTransactions = {}
        this.addressInfoStreams = {}
        this.unconfirmedTransactionStreams = {}
    }

    /*
    <time-ago .datetime=${new Date(transaction.transaction.timestamp).toISOString()}>

                                                    </time-ago>
                                                    */
    /*

                        <div>
                            <span class="mono weight-100" style="font-size: 70px;">${this.floor(this.selectedAddressInfo.nativeBalance.total[1])}<span
                                    style="font-size:24px; vertical-align: top; line-height:60px;">.${this.decimals(this.selectedAddressInfo.nativeBalance.total[1])}
                                    KEX</span></span>
                        </div>
    */
    render () {
        return html`
            <div class="white-bg">
                <div ?hidden="${!this.loading}" class="layout horizontal center" style="height:100vh;">
                <div class="layout vertical center" style="width:100%;">
                    <paper-spinner-lite ?active="${this.loading}" alt="Loading address"></paper-spinner-lite>
                </div>
                </div>
                
                
                <div ?hidden="${this.loading}">
                    <div id="topbar" style="background:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx; color: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; padding: 20px;">
                        <span class="mono weight-1300">
                            <iron-icon icon="account-balance-wallet"></iron-icon> ${this.selectedAddress.address}
                        </span>
                        <!-- <template is="dom-if" if="{{!address.name}}">
                                                        <paper-button on-tap="setName"><i>Set name</i></paper-button>
                                                    </template> -->
                        <br>
                        <div class="layout horizontal wrap">
                            <div>
                                <span class="mono weight-100" style="font-size: 70px;">${this.floor(this.selectedAddressInfo.nativeBalance.total[0])}<span
                                        style="font-size:24px; vertical-align: top; line-height:60px;">.${this.decimals(this.selectedAddressInfo.nativeBalance.total[0])}
                                        KMX</span></span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                
                        </div>
                    </div>
                
                    <div id="contentDiv" style="margin: 8px;">
                
                
                
                        <div class="layout horizontal">
                            <paper-card style="width:100%">
                
                                <!-- <div class="card-content"  hidden$="{{!isEmptyArray(address.transactions)}}"> -->
                                <!--!this.isEmptyArray(this.selectedAddressTransactions)-->
                                <div class="card-content" ?hidden="${[...this.selectedAddressInfo.transactions].length > 0}">
                                    Address has no transactions yet. Start by sending some KMX to <b>${this.selectedAddress.address}</b>
                                    or
                                    by claiming KEX from the airdrop.
                                </div>
                
                                <div id="tableContainer" style="max-width:100vw; overflow-x: auto;" ?hidden=${this.selectedAddressInfo.transactions.length < 1}>
                                    <h3 style="padding-left:12px;" class="mono weight-100">Recent transactions</h3>
                                    <table cellspacing="0" cellpadding="0">
                                        <tr>
                                            <th>Time</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Confirmations</th>
                                            <th>Sender/Recipient</th>
                                        </tr>
                                        ${this.selectedAddressInfo.transactions.map(transaction => html`
                                            <tr>
                                                <td>
                                                    
                                                     ${transaction.transaction.dateTime}
                                                </td>
                                                <td>
                                                    <span class="${this._unconfirmedClass(transaction.transaction.unconfirmed)}}">
                                                        ${this.getTxType(transaction.transaction.type)}
                                                    </span>
                                                </td>
                                                <td style="min-width:60px;">
                                                    <span class="mono ${this.txColor(transaction.transaction)} ${this._unconfirmedClass(transaction.transaction.unconfirmed)}}">
                                                        <!-- Ugly to avoid the space -->
                                                        <mwc-icon style="height:16px; font-size:16px;">${this.sendOrRecieve(transaction.transaction) ? 'add_circle' : 'remove_circle'}</mwc-icon>
                                                        <span>${this.floor(transaction.transaction.amount)}</span>
                                                        <span style="font-size:12px; vertical-align:top; line-height:16px;">${this.decimals(transaction.transaction.amount)}</span>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="${this._unconfirmedClass(transaction.transaction.unconfirmed)}}">
                                                    <!-- this.lastBlock.height -->
                                                        ${!transaction.unconfirmed ? this.getConfirmations(transaction.transaction.blockHeight, this.selectedAddressInfo.lastBlock.height) : '0'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="${this._unconfirmedClass(transaction.unconfirmed)}">${this.senderOrRecipient(transaction.transaction)}</span>
                                                </td>
                                            </tr> 
                                        `)}
                                    </table>
                                </div>
                
                
                
                                <vaadin-grid ?hidden="${this.isEmptyArray(this.selectedAddressTransactions)}" height-by-rows style="height:auto;"
                                    aria-label="Transactions" items="${this.selectedAddressTransactions}">
                
                                    <vaadin-grid-column flex-grow="x">
                                        <template class="header">
                                            <iron-icon style="height:16px" icon="device:access-time"></iron-icon>
                                        </template>
                                        <template>
                                            <span class$="{{_unconfirmedClass(item.unconfirmed)}}">
                                                <time-ago datetime$="{(new Date(this.item.transaction.timestamp).toISOString())}">
                                                    {{item.transaction.dateTime}}
                                                </time-ago>
                                            </span>
                                        </template>
                                    </vaadin-grid-column>
                
                                    <vaadin-grid-column>
                                        <template class="header">
                                            Type
                                        </template>
                                        <template>
                                            <span class$="{{_unconfirmedClass(item.unconfirmed)}}">
                                                {{getTxType(item.transaction.type)}}
                                            </span>
                                        </template>
                                    </vaadin-grid-column>
                
                                    <vaadin-grid-column>
                                        <template class="header">
                                            Amount
                                            <!-- + fee -->
                                        </template>
                                        <template>
                                            <span class$="mono {{txColor(item.transaction)}} {{_unconfirmedClass(item.unconfirmed)}}">
                                                <!-- Ugly to avoid the space -->
                                                <iron-icon hidden$="{{sendOrRecieve(item.transaction)}}" icon="icons:add-circle" style="height:16px;"></iron-icon>
                                                <iron-icon hidden$="{{!sendOrRecieve(item.transaction)}}" icon="icons:remove-circle"
                                                    style="height:16px; font-size:16px;"></iron-icon><span>[[floor(item.transaction.amount)]]</span><span
                                                    style="font-size:12px; vertical-align:top; line-height:16px;">[[decimals(item.transaction.amount)]]</span>
                                                <!-- +
                                                                            <span>[[floor(item.transaction.fee)]]</span
                                                                                ><span style="font-size:8px; vertical-align:top; line-height:16px;">[[decimals(item.transaction.fee)]]</span> -->
                                            </span>
                                        </template>
                                    </vaadin-grid-column>
                
                                    <vaadin-grid-column flex-grow="4">
                                        <template class="header">
                                            Sender/Recipient
                                        </template>
                                        <template>
                                            <span class$="{{_unconfirmedClass(item.unconfirmed)}}">{{senderOrRecipient(item.transaction)}}</span>
                                        </template>
                                    </vaadin-grid-column>
                
                                    <vaadin-grid-column>
                                        <template class="header">
                                            Confirmations
                                        </template>
                                        <template>
                                            <span class$="{{_unconfirmedClass(item.unconfirmed)}}">
                                                <template is="dom-if" if="{{!item.unconfirmed}}">
                                                    {{getConfirmations(item.transaction.blockHeight, lastBlock.height)}}
                                                </template>
                                                <template is="dom-if" if="{{item.unconfirmed}}">
                                                    0
                                                </template>
                                            </span>
                                        </template>
                                    </vaadin-grid-column>
                
                                </vaadin-grid>
                
                            </paper-card>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    _getAllTransactions (transactions, addressesUnconfirmedTransactions) {
        // console.log("UPDATING TRANSACTIONS")
        const unconfirmedTransactions = addressesUnconfirmedTransactions[this.selectedAddress.address]
        // console.log(transactions, unconfirmedTransactions)
        if (!(transactions && unconfirmedTransactions)) return []
        return [].concat(unconfirmedTransactions, transactions)
    }

    firstUpdated () {
        parentEpml.ready().then(() => {
            // Guess this is our version of state management...should make a plugin for it...proxied redux or whatever lol
            parentEpml.subscribe('selected_address', async selectedAddress => {
                console.log(selectedAddress)
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                // console.log('==========================SELECTED ADDRESS',selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
                this.selectedAddress = selectedAddress
                const addr = selectedAddress.address
                // console.log(selectedAddress)
                // console.log(addr)

                // Let's just assume ok
                // const ready = coreEpml.ready()
                // await ready
                // console.log('Core ready FFUCCC')

                if (!this.addressInfoStreams[addr]) {
                    console.log('AND DIDN\'T FIND AN EXISTING ADDRESS STREAM')
                    this.addressInfoStreams[addr] = coreEpml.subscribe(`address/${addr}`, addrInfo => {
                        addrInfo = JSON.parse(addrInfo)
                        console.log('FINALLY RECEIVE ADDR INFO DUMB', addrInfo)
                        this.loading = false

                        addrInfo.nativeBalance = addrInfo.nativeBalance || { total: {} }
                        // console.log('NATIVE',addrInfo)
                        // addrInfo.nativeBalance.total['0'] = addrInfo.nativeBalance.total['0'] || 0
                        // addrInfo.nativeBalance.total['1'] = addrInfo.nativeBalance.total['1'] || 0
                        console.log(addrInfo.nativeBalance)
                        this.addressesInfo = {
                            ...this.addressesInfo,
                            [addr]: addrInfo
                        }
                        this.selectedAddressInfo = this.addressesInfo[this.selectedAddress.address]
                        // console.log(this.addressesInfo)
                        console.log(this.selectedAddressInfo)
                        // const addressesInfoStore = this.addressesInfo
                        // this.addressesInfo = {}
                        // this.addressesInfo = addressesInfoStore
                    })
                }
                if (!this.unconfirmedTransactionStreams[addr]) {
                    console.log('AND DIDN\'T FIND AN EXISTING UNCONFIRMED TX STREAM')
                    this.addressesUnconfirmedTransactions[addr] = []

                    this.unconfirmedTransactionStreams[addr] = coreEpml.subscribe(`unconfirmedOfAddress/${addr}`, unconfirmedTransactions => {
                        unconfirmedTransactions = JSON.parse(unconfirmedTransactions)
                        console.log(unconfirmedTransactions)
                        unconfirmedTransactions = unconfirmedTransactions.map(tx => {
                            return {
                                transaction: tx,
                                unconfirmed: true
                            }
                        })

                        console.log('RECEIVED UNCONFIRMED TX INFO', unconfirmedTransactions)

                        this.addressesUnconfirmedTransactions[addr] = unconfirmedTransactions
                        const addressesUnconfirmedTransactionsStore = this.addressesUnconfirmedTransactions
                        this.addressesUnconfirmedTransactions = {}
                        this.addressesUnconfirmedTransactions = addressesUnconfirmedTransactionsStore
                    })
                }
            })
        })

        coreEpml.ready().then(() => coreEpml.subscribe('new_block', block => {
            console.log('---- BLOCK ----', block)
            this.lastBlock = block
        }))

        parentEpml.imReady()
        coreEpml.imReady()
    }

    isEmptyArray (arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
    floor (num) {
        num = parseFloat(num)
        return isNaN(num) ? 0 : this._format(Math.floor(num))
    }
    decimals (num) {
        num = parseFloat(num) // So that conversion to string can get rid of insignificant zeros
        // return isNaN(num) ? 0 : (num + "").split(".")[1]
        return num % 1 > 0 ? (num + '').split('.')[1] : '0'
    }

    sendOrRecieve (tx) {
        return tx.sender == this.selectedAddress.address
    }

    senderOrRecipient (tx) {
        return this.sendOrRecieve(tx) ? tx.recipient : tx.sender
    }

    txColor (tx) {
        return this.sendOrRecieve(tx) ? 'red' : 'green'
    }
    getTxType (type) {
        return TX_TYPES[type]
    }
    subtract (num1, num2) {
        return num1 - num2
    }
    getConfirmations (height, lastBlockHeight) {
        return lastBlockHeight - height + 1
    }

    // _addressObserver(address){
    //     if(!address || this.lastAddress == address){
    //         return
    //     }
    //     console.log("UPDATING")
    //     this._updateAccount(address);
    //     this.lastAddress = address
    // }

    _format (num) {
        return num.toLocaleString()
    }

    textColor (color) {
        return color === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.87)'
    }
    _unconfirmedClass (unconfirmed) {
        return unconfirmed ? 'unconfirmed' : ''
    }
}

window.customElements.define('wallet-app', WalletApp)
