/* Webcomponents polyfill... https://github.com/webcomponents/webcomponentsjs#using-webcomponents-loaderjs */
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
/* Es6 browser but transpi;led code */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'

import { LitElement, html, css } from 'lit-element'
// import { Epml } from '../../../src/epml.js'
import { Epml } from '../../../epml.js'

import '@polymer/paper-spinner/paper-spinner-lite.js'

// import * as thing from 'time-elements'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/theme/material/all-imports.js'

import '@material/mwc-icon'
import '@material/mwc-textfield'
import '@material/mwc-button'
import '@material/mwc-icon'
import '@material/mwc-dialog'

const parentEpml = new Epml({ type: 'WINDOW', source: window.parent })

class NodeManagement extends LitElement {
    static get properties() {
        return {
            loading: { type: Boolean },
            upTime: { type: String },
            mintingAccounts: { type: Array },
            peers: { type: Array },
            addMintingAccountLoading: { type: Boolean },
            addPeerLoading: { type: Boolean },
            addMintingAccountKey: { type: String },
            addPeerMessage: { type: String },
            addMintingAccountMessage: { type: String }
        }
    }

    static get styles() {
        return css`
            * {
                --mdc-theme-primary: rgb(3, 169, 244);
                --paper-input-container-focus-color: var(--mdc-theme-primary);
            }

            paper-spinner-lite{
                height: 24px;
                width: 24px;
                --paper-spinner-color: var(--mdc-theme-primary);
                --paper-spinner-stroke-width: 2px;
            }

            #node-management-page {
                background:#fff;
            }

            mwc-textfield { 
                width:100%;
            }

            .red {
                --mdc-theme-primary: red;
            }

            mwc-button.red-button {
                --mdc-theme-primary: red;
                --mdc-theme-on-primary: white;
            }

            .node-card {
                /* margin:12px; */
                padding:12px 24px;
                background:#fff;
                border-radius:2px;
                box-shadow: 11;
            }

            h2 {
                margin:0;
            }

            h2, h3, h4, h5 {
                color:#333;
                font-weight: 400;
            }

            [hidden] {
                display: hidden !important;
                visibility: none !important;
            }
        `
    }

    constructor() {
        super()
        this.upTime = ""
        this.mintingAccounts = []
        this.peers = []
        this.addPeerLoading = false
        this.addMintingAccountLoading = false
        this.addMintingAccountKey = ''
        this.addPeerMessage = ''
        this.addMintingAccountMessage = ''
        this.config = {
            user: {
                node: {

                }
            }
        }
    }

    render() {
        return html`
            <div id="node-management-page">

                <div class="node-card">
                    <h2>Node management for ${this.config.user.node.domain}</h2>
                    <span><br>Node has been online for ${this.upTime}</span>

                    <br><br>
                    <div id="minting">
                        <div style="min-height:48px; display: flex; padding-bottom: 6px;">
                            <h3 style="margin: 0; flex: 1; padding-top: 8px; display: inline;">Node's minting accounts</h3>
                            <mwc-button style="float:right;" @click=${() => this.shadowRoot.querySelector('#addMintingAccountDialog').show()}><mwc-icon>add</mwc-icon>Add minting account</mwc-button>
                        </div>

                        <mwc-dialog id="addMintingAccountDialog" scrimClickAction="${this.addMintingAccountLoading ? '' : 'close'}">
                            <div>If you would like to mint with your own account you will need to create a rewardshare transaction to yourself (with rewardshare percent set to 0), and then mint with the rewardshare key it gives you.</div>
                            <br>
                            <mwc-textfield ?disabled="${this.addMintingAccountLoading}" label="Rewardshare key" id="addMintingAccountKey"></mwc-textfield>
                            <div style="text-align:right; height:36px;" ?hidden=${this.addMintingAccountMessage === ''}>
                                <span ?hidden="${this.addMintingAccountLoading}">
                                    ${this.addMintingAccountMessage} &nbsp;
                                </span>
                                <span ?hidden="${!this.addMintingAccountLoading}">
                                    <!-- loading message -->
                                    Doing something delicious &nbsp;
                                    <paper-spinner-lite
                                        style="margin-top:12px;"
                                        ?active="${this.addMintingAccountLoading}"
                                        alt="Adding minting account"></paper-spinner-lite>
                                </span>
                            </div>
                            <mwc-button
                                ?disabled="${this.addMintingAccountLoading}"
                                slot="primaryAction"
                                @click=${this.addMintingAccount}
                                >
                                <!--dialogAction="add"-->
                                Add
                            </mwc-button>
                            <mwc-button
                                ?disabled="${this.addMintingAccountLoading}"
                                slot="secondaryAction"
                                dialogAction="cancel"
                                class="red">
                                Close
                            </mwc-button>
                        </mwc-dialog>

                        <vaadin-grid id="mintingAccountsGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.mintingAccounts)}" aria-label="Peers" .items="${this.mintingAccounts}" height-by-rows>
                            <vaadin-grid-column path="mintingAccount"></vaadin-grid-column>
                            <vaadin-grid-column path="recipientAccount"></vaadin-grid-column>
                        </vaadin-grid>

                        ${this.isEmptyArray(this.mintingAccounts) ? html`
                            No minting accounts found for this node
                        `: ''}
                    </div>

                    <br>
                    <div id="peers">
                        <div style="min-height: 48px; display: flex; padding-bottom: 6px;">
                            <h3 style="margin: 0; flex: 1; padding-top: 8px; display: inline;">Peers connected to node</h3>
                            <mwc-button
                            @click=${() => this.shadowRoot.querySelector('#addPeerDialog').show()}><mwc-icon>add</mwc-icon>Add peer</mwc-button>
                        </div>


                        <mwc-dialog id="addPeerDialog" scrimClickAction="${this.addPeerLoading ? '' : 'close'}">
                            <div>Type the peer you wish to add's address below</div>
                            <br>
                            <mwc-textfield ?disabled="${this.addPeerLoading}" label="Peer address" id="addPeerAddress"></mwc-textfield>
                            <div style="text-align:right; height:36px;" ?hidden=${this.addPeerMessage === ''}>
                                <span ?hidden="${this.addPeerLoading}">
                                    ${this.addPeerMessage} &nbsp;
                                </span>
                                <span ?hidden="${!this.addPeerLoading}">
                                    <paper-spinner-lite
                                        style="margin-top:12px;"
                                        ?active="${this.addPeerLoading}"
                                        alt="Adding minting account"></paper-spinner-lite>
                                </span>
                            </div>
                            <mwc-button
                                ?disabled="${this.addPeerLoading}"
                                @click="${this.addPeer}"
                                slot="primaryAction">
                                Add
                            </mwc-button>
                            <mwc-button
                                slot="secondaryAction"
                                dialogAction="cancel"
                                ?disabled="${this.addPeerLoading}"
                                class="red">
                                Close
                            </mwc-button>
                        </mwc-dialog>

                        <vaadin-grid id="peersGrid" style="height:auto;" ?hidden="${this.isEmptyArray(this.peers)}" aria-label="Peers" .items="${this.peers}" height-by-rows>
                            <vaadin-grid-column path="address"></vaadin-grid-column>
                            <vaadin-grid-column path="lastHeight"></vaadin-grid-column>
                        </vaadin-grid>

                        ${this.isEmptyArray(this.peers) ? html`
                            Node has no connected peers
                        `: ''}
                    </div>
                    <br>
                    <!-- <mwc-button class="red-button"><mwc-icon style="width:24px;">highlight_off</mwc-icon>&nbsp; Shutdown node</mwc-button> -->
                </div>
            </div>
        `
    }

    addPeer(e) {
        this.addPeerLoading = true
        const addPeerAddress = this.shadowRoot.querySelector('#addPeerAddress').value

        parentEpml.request('apiCall', {
            url: `/peers`,
            method: 'POST',
            body: addPeerAddress
        }).then(res => {
            this.addPeerMessage = res.message
            console.log(res)
            this.addPeerLoading = false
        })

    }

    addMintingAccount(e) {
        this.addMintingAccountLoading = true
        this.addMintingAccountMessage = "Doing something delicious"

        const addMintingAccountKey = this.shadowRoot.querySelector('#addMintingAccountKey').value

        parentEpml.request('apiCall', {
            url: `/admin/mintingaccounts`,
            method: 'POST',
            body: addMintingAccountKey
        }).then(res => {
            this.addMintingAccountMessage = res.message
            this.addMintingAccountLoading = false
            if (res === 'true') this.addMintingAccountMessage = 'Success!'
        })


        // this.addMintingAccountLoading = false
    }

    firstUpdated() {
        // Calculate HH MM SS from Milliseconds...
        const convertMsToTime = milliseconds => {
            let day, hour, minute, seconds;
            seconds = Math.floor(milliseconds / 1000);
            minute = Math.floor(seconds / 60);
            seconds = seconds % 60;
            hour = Math.floor(minute / 60);
            minute = minute % 60;
            day = Math.floor(hour / 24);
            hour = hour % 24;
            return day + "d " + hour + "h " + minute + "m";
        };

        const getNodeUpTime = () => {
            console.log("=========================================");
            parentEpml
                .request("apiCall", {
                    url: `/admin/uptime`
                })
                .then(res => {
                    // console.log(res);
                    this.upTime = "";
                    setTimeout(() => {
                        this.upTime = convertMsToTime(res);
                    }, 1);
                });

            setTimeout(getNodeUpTime, this.config.user.nodeSettings.pingInterval);
        };

        const updateMintingAccounts = () => {
            // console.log('=========================================')
            parentEpml.request('apiCall', {
                url: `/admin/mintingaccounts`
            }).then(res => {
                console.log(res)
                this.mintingAccounts = []
                setTimeout(() => { this.mintingAccounts = res }, 1)
            })

            setTimeout(updateMintingAccounts, this.config.user.nodeSettings.pingInterval) // Perhaps should be slower...?
        }

        const updatePeers = () => {
            parentEpml.request('apiCall', {
                url: `/peers`
            }).then(res => {
                this.peers = []
                setTimeout(() => { this.peers = res }, 1)
            })

            setTimeout(updatePeers, this.config.user.nodeSettings.pingInterval)
        }

        let configLoaded = false
        parentEpml.ready().then(() => {
            parentEpml.subscribe('config', c => {
                if (!configLoaded) {
                    setTimeout(getNodeUpTime, 1)
                    setTimeout(updatePeers, 1)
                    setTimeout(updateMintingAccounts, 1)
                    configLoaded = true
                }
                this.config = JSON.parse(c)
            })
        })

        parentEpml.imReady()
    }

    isEmptyArray(arr) {
        if (!arr) { return true }
        return arr.length === 0
    }
}

window.customElements.define('node-management', NodeManagement)
