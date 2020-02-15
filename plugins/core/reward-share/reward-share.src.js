/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml.js'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-dialog'
import '@material/mwc-slider'

import '@polymer/paper-spinner/paper-spinner-lite.js'
// import '@polymer/paper-input/paper-input.js'
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
            selectedAddress: { type: Object },
            createRewardShareLoading: { type: Boolean },
            rewardSharePercentage: { type: Number },
            error: { type: Boolean },
            message: { type: String }
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --mdc-theme-secondary: var(--mdc-theme-primary);
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
        this.rewardSharePercentage = 0
        this.createRewardShareLoading = false
    }

    /*
<h2>Create reward shares</h2>
                <span><br>Creating a reward share for another account requires an account with level 5 or higher. If you are doing a self share (a reward share to your account) then put 0% for reward share percentage.</span>

                <paper-input label="Recipient public key" id="recipientPublicKey" type="text" value="${this.recipientPublicKey}"></paper-input>
                <paper-input label="Reward share percentage" id="percentageShare" type="number" value="${this.percentageShare}"></paper-input>

                <mwc-button @click=${this.createRewardShare} style="width:100%;">Create rewardshare key</mwc-button>
    */

    render() {
        return html`
            <div id="reward-share-page">
                <div style="min-height:48px; display: flex; padding-bottom: 6px;">
                    <h3 style="margin: 0; flex: 1; padding-top: 8px; display: inline;">Rewardshares involving this account</h3>
                    <mwc-button style="float:right;" @click=${() => this.shadowRoot.querySelector('#createRewardShareDialog').show()}><mwc-icon>add</mwc-icon>Create reward share</mwc-button>
                </div>

                <vaadin-grid id="accountRewardSharesGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.accountRewardShares)}" aria-label="Peers" .items="${this.accountRewardShares}" height-by-rows>
                    <vaadin-grid-column path="address"></vaadin-grid-column>
                    <vaadin-grid-column path="lastHeight"></vaadin-grid-column>
                </vaadin-grid>

                <mwc-dialog id="createRewardShareDialog" scrimClickAction="${this.createRewardShareLoading ? '' : 'close'}">
                    <div>You must be level 5 or above to create a rewardshare!</div>
                    <br>
                    <mwc-textfield style="width:100%;" ?disabled="${this.createRewardShareLoading}" label="Reward share public key" id="recipientPublicKey"></mwc-textfield>
                    <p style="margin-bottom:0;">
                        Reward share percentage: ${this.rewardSharePercentage}
                        <!-- <mwc-textfield style="width:36px;" ?disabled="${this.createRewardShareLoading}" id="createRewardShare"></mwc-textfield> -->
                    </p>
                    <mwc-slider
                        @change="${e => this.rewardSharePercentage = this.shadowRoot.getElementById('rewardSharePercentageSlider').value}"
                        id="rewardSharePercentageSlider"
                        style="width:100%;"
                        step="1"
                        pin
                        markers
                        max="100"
                        value="${this.rewardSharePercentage}">
                    </mwc-slider>
                    <div style="text-align:right; height:36px;">
                        <span ?hidden="${!this.createRewardShareLoading}">
                            <!-- loading message -->
                            Doing something delicious &nbsp;
                            <paper-spinner-lite
                                style="margin-top:12px;"
                                ?active="${this.createRewardShareLoading}"
                                alt="Adding minting account"></paper-spinner-lite>
                        </span>
                        <span ?hidden=${this.message === ''} style="${this.error ? 'color:red;' : ''}">
                            ${this.message}
                        </span>
                    </div>
                    
                    <mwc-button
                        ?disabled="${this.createRewardShareLoading}"
                        slot="primaryAction"
                        @click=${this.createRewardShare}
                        >
                        <!--dialogAction="add"-->
                        Add
                    </mwc-button>
                    <mwc-button
                        ?disabled="${this.createRewardShareLoading}"
                        slot="secondaryAction"
                        dialogAction="cancel"
                        class="red">
                        Close
                    </mwc-button>
                </mwc-dialog>


                ${this.isEmptyArray(this.accountRewardShares) ? html`
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

    async createRewardShare (e) {
        this.error = false
        this.message = ''
        const recipientPublicKey = this.shadowRoot.getElementById("recipientPublicKey").value
        const percentageShare = this.shadowRoot.getElementById("rewardSharePercentageSlider").value // or just this.rewardSharePercentage?
        // var fee = this.fee

        // Check for valid...^
        this.createRewardShareLoading = true

        try {
            const lastReference = await parentEpml.request('apiCall', {
                type: 'api',
                url: `/addresses/lastreference/${this.selectedAddress.address}`
            })

            console.log(lastReference)

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

            // const responseData = JSON.parse(txRequestResponse) // JSON.parse(txRequestResponse)
            const responseData = txRequestResponse // Maybe it's already parsed?
            console.log(responseData)
            if (!responseData.reference) {
                if (responseData.success === false) {
                    throw new Error(responseData.message)
                }
                // ${ERROR_CODES[responseData]}
                // if (ERROR_CODES[responseData]) throw new Error(`Error!. Code ${responseData}: ${ERROR_CODES[responseData]}`)
                throw new Error(`Error! ${responseData}`)
                // throw new Error(`Error!. ${ ERROR_CODES[responseData]}`)
            }
            this.message = 'Success?'
            this.error = false
        } catch (e) {
            console.error(e)
            console.log(e.message)
            this.error = true
            this.message = e.message

        }
        this.createRewardShareLoading = false
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
}

window.customElements.define('reward-share', RewardShare)
