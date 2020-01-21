/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml.js'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@polymer/paper-spinner/paper-spinner-lite.js'
import '@polymer/paper-input/paper-input.js'
// import * as thing from 'time-elements'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class RewardShare extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            rewardShares : { type: Array },
            recipientPublicKey: { type: String },
            percentageShare: { type: String },
            selectedAddress: { type: Object }
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }
            #reward-share-page {
                background: #fff;
                padding: 12px 24px;
            }

            h2 {
                margin:0;
            }

            h2, h3, h4, h5 {
                color:#333;
                font-weight: 400;
            }
        `
    }

    constructor() {
        super()
        this.selectedAddress = {}
        this.rewardShares = []
        this.recipientPublicKey = ''
        this.percentageShare = 0
    }

    render() {
        return html`
            <div id="reward-share-page">
                <h2>Create reward shares</h2>
                <span><br>Creating a reward share requires an account with level 5 or higher</span>

                <paper-input label="Recipient public key" id="recipientPublicKey" type="text" value="${this.recipientPublicKey}"></paper-input>
                <paper-input label="Reward share percentage" id="percentageShare" type="number" value="${this.percentageShare}"></paper-input>

                <mwc-button @click=${this.createRewardShareTransaction} style="width:100%;">Create rewardshare key</mwc-button>
                
                <h3>Reward shares involving this account</h3>
                <vaadin-grid id="peersGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.peers)}" aria-label="Peers" .items="${this.peers}" height-by-rows>
                    <vaadin-grid-column path="address"></vaadin-grid-column>
                    <vaadin-grid-column path="lastHeight"></vaadin-grid-column>
                </vaadin-grid>

                ${this.isEmptyArray(this.peers) ? html`
                    Account is not involved in any reward shares
                `: ''}
            </div>
        `
    }

    firstUpdated() {
        parentEpml.ready().then(() => {
            // Guess this is our version of state management...should make a plugin for it...proxied redux or whatever lol
            parentEpml.subscribe('selected_address', async selectedAddress => {
                this.selectedAddress = {}
                selectedAddress = JSON.parse(selectedAddress)
                // console.log('==========================SELECTED ADDRESS',selectedAddress)
                if (!selectedAddress || Object.entries(selectedAddress).length === 0) return // Not ready yet ofc
                this.selectedAddress = selectedAddress
            })
        })

        parentEpml.imReady()
    }

    async createRewardShareTransaction (e) {
        const recipientPublicKey = this.shadowRoot.querySelector("#recipientPublicKey").value
        const percentageShare = this.shadowRoot.querySelector("#percentageShare").value
        // var fee = this.fee

        // Check for valid...^
        this.createRewardShareLoading = true

        try {
            const lastReference = await parentEpml.request('apiCall', {
                type: 'api',
                url: `addresses/lastreference/${this.selectedAddress.address}`
            })

            const txRequestResponse = await parentEpml.request('transaction', {
                type: 38,
                nonce: this.selectedAddress.nonce,
                params: {
                    recipientPublicKey,
                    percentageShare,
                    lastReference
                    // ,
                    // fee
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
        } catch (e) {
            console.error(e)
        }
        this.createRewardShareLoading = false
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
}

window.customElements.define('reward-share', RewardShare)
