(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    const parentEpml = new Epml({
      type: 'WINDOW',
      source: window.parent
    });
    const visiblePluginEpml = new Epml({
      type: 'PROXY',
      source: {
        proxy: parentEpml,
        target: 'visible-plugin',
        id: 'core-plugin' // self id for responses, matches that in proxy.html

      }
    });

    const DEFAULT_ADDRESS_INFO = {};
    class AddressWatcher {
      constructor(addresses) {
        addresses = addresses || [];
        this.reset();
        addresses.forEach(addr => this.addAddress(addr));
      }

      reset() {
        this._addresses = {};
        this._addressStreams = {};
      } // Adds an address to watch


      addAddress(address) {
        const addr = address.address;
        this._addresses[addr] = address;
        this._addressStreams[addr] = new EpmlStream(`address/${addr}`, () => this._addresses[addr]);
        this.updateAddress(addr);
      }

      async testBlock(block) {
        // console.log('TESTING BLOCK')
        const pendingUpdateAddresses = []; // blockTests.forEach(fn => {
        // })
        // transactionTests.forEach(fn => {
        // 

        const transactions = await parentEpml.request('apiCall', {
          url: `/transactions/block/${block.signature}`
        });
        transactions.forEach(transaction => {
          // console.log(this)
          // fn(transaction, Object.keys(this._addresses))
          // Guess the block needs transactions
          for (const addr of Object.keys(this._addresses)) {
            // const addrChanged = transactionTests.some(fn => {
            //     return fn(transaction, addr)
            // })
            console.log('checking ' + addr);
            if (!(addr in pendingUpdateAddresses)) pendingUpdateAddresses.push(addr);
            /**
             * In the future transactions are potentially stored from here...and address is updated excluding transactions...and also somehow manage tx pages...
             * Probably will just make wallet etc. listen for address change and then do the api call itself. If tx. page is on, say, page 3...and there's a new transaction...
             * it will refresh, changing the "page" to have 1 extra transaction at the top and losing 1 at the bottom (pushed to next page)
             */
          }
        });
        pendingUpdateAddresses.forEach(addr => this.updateAddress(addr));
      }

      async updateAddress(addr) {
        // console.log('UPPPDDAAATTTINGGG AADDDRRR', addr)
        let addressRequest = await parentEpml.request('apiCall', {
          type: 'explorer',
          data: {
            addr: addr,
            txOnPage: 10
          }
        }); // addressRequest = JSON.parse(addressRequest)
        // console.log(addressRequest, 'AAADDDREESS REQQUEESTT')

        console.log('response: ', addressRequest);
        const addressInfo = addressRequest.success ? addressRequest.data : DEFAULT_ADDRESS_INFO; // const addressInfo = addressRequest.success ? addressRequest.data : DEFAULT_ADDRESS_INFO

        addressInfo.transactions = [];

        for (let i = addressInfo.start; i >= addressInfo.end; i--) {
          addressInfo.transactions.push(addressInfo[i]);
          delete addressInfo[i];
        }

        console.log('ADDRESS INFO', addressInfo);
        if (!(addr in this._addresses)) return;
        this._addresses[addr] = addressInfo;
        console.log('---------------------------Emitting-----------------------------', this._addresses[addr], this._addressStreams[addr]);

        this._addressStreams[addr].emit(addressInfo);
      }

    }

    class UnconfirmedTransactionWatcher {
      constructor() {
        this._unconfirmedTransactionStreams = {};
        this.reset(); // Sets defaults

        setInterval(() => {
          Object.entries(this._addresses).forEach(addr => this._addressTransactionCheck(addr[0]));
        }, 10 * 1000);
      }

      reset() {
        this._addresses = {};
        this._addressesUnconfirmedTransactions = {};
      } // Adds an address to watch


      addAddress(address) {
        // console.log("Added address", address)
        const addr = address.address;
        this._addresses[addr] = address;
        this._addressesUnconfirmedTransactions[addr] = [];
        if (this._unconfirmedTransactionStreams[addr]) return; // console.log("CREATING A STRTRREEAAAMMMM")

        this._unconfirmedTransactionStreams[addr] = new EpmlStream(`unconfirmedOfAddress/${addr}`, () => this._addressesUnconfirmedTransactions[addr]); // this.updateAddress(address.address)
      }

      check() {
        // console.log("checkin for unconfirmed")
        const c = this._addressTransactionCheck().then(() => setTimeout(() => this.check(), 5000)).catch(() => setTimeout(() => this.check(), 5000)); // console.log(c)

      }

      async _addressTransactionCheck() {
        // console.log("Checking for unconfirmed transactions")
        // console.log(this._addresses, Object.keys(this._addresses))
        return Promise.all(Object.keys(this._addresses).map(addr => {
          // console.log(`checking ${addr}`)
          return parentEpml.request('apiCall', {
            type: 'api',
            // url: `transactions/unconfirmedof/${addr}`
            url: `/transactions/unconfirmed`
          }).then(unconfirmedTransactions => {
            // unconfirmedTransactions = JSON.parse(unconfirmedTransactions)
            console.log(unconfirmedTransactions);
            unconfirmedTransactions.filter(tx => {
              tx.creatorAddress === addr || tx.recipient === addr;
            }); // console.log(unconfirmedTransactions, unconfirmedTransactions.length)
            // if(unconfirmedTransactions.length === 0) {
            //     return
            // }

            this._unconfirmedTransactionStreams[addr].emit(unconfirmedTransactions); // console.log(this._unconfirmedTransactionStreams[addr])

          });
        }));
      }

    }

    class TwoWayMap {
      constructor(map) {
        this._map = map || new Map();
        this._revMap = new Map();

        this._map.forEach((key, value) => {
          this._revMap.set(value, key);
        });
      }

      values() {
        return this._map.values();
      }

      entries() {
        return this._map.entries();
      }

      push(key, value) {
        this._map.set(key, value);

        this._revMap.set(value, key);
      }

      getByKey(key) {
        return this._map.get(key);
      }

      getByValue(value) {
        return this._revMap.get(value);
      }

      hasKey(key) {
        return this._map.has(key);
      }

      hasValue(value) {
        return this._revMap.has(value);
      }

      deleteByKey(key) {
        const value = this._map.get(key);

        this._map.delete(key);

        this._revMap.delete(value);
      }

      deleteByValue(value) {
        const key = this._revMap.get(value);

        this._map.delete(key);

        this._revMap.delete(value);
      }

    }

    // Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

    const proxySources = new TwoWayMap();

    const BLOCK_CHECK_INTERVAL = 3000; // You should be runn off config.user.nodeSettings.pingInterval...

    const BLOCK_CHECK_TIMEOUT = 3000;
    const BLOCK_STREAM_NAME = 'new_block';
    const onNewBlockFunctions = [];
    let mostRecentBlock = {
      height: -1
    };
    const onNewBlock = newBlockFn => onNewBlockFunctions.push(newBlockFn);
    const check = () => {
      const c = doCheck(); // CHANGE TO Promise.prototype.finally

      c.then(() => {
        setTimeout(() => check(), BLOCK_CHECK_INTERVAL);
      });
      c.catch(() => {
        setTimeout(() => check(), BLOCK_CHECK_INTERVAL);
      });
    };

    const doCheck = async () => {
      let timeout = setTimeout(() => {
        throw new Error('Block check timed out');
      }, BLOCK_CHECK_TIMEOUT);
      const block = await parentEpml.request('apiCall', {
        url: '/blocks/last'
      });
      clearTimeout(timeout);
      console.log(block); // const parsedBlock = JSON.parse(block)
      // console.log(parsedBlock, mostRecentBlock)

      if (block.height > mostRecentBlock.height) {
        // console.log('NNEEEWWW BLLOOCCCKKK')
        mostRecentBlock = block;
        onNewBlockFunctions.forEach(fn => fn(mostRecentBlock));
      }
    };

    const addrWatcher = new AddressWatcher();
    const txWatcher = new UnconfirmedTransactionWatcher();
    let mostRecentBlock$1 = {
      height: -1
    };
    const blockStream = new EpmlStream(BLOCK_STREAM_NAME, () => {
      console.log('WE GOT A SUBSCRIPTION');
      return mostRecentBlock$1;
    });
    parentEpml.subscribe('logged_in', async isLoggedIn => {
      if (isLoggedIn === 'true') {
        // console.log('"logged_in stream" in core/main.js', isLoggedIn)
        const addresses = await parentEpml.request('addresses');
        const parsedAddresses = addresses; // JSON.parse(addresses)

        console.log(parsedAddresses); // console.log(parsedAddress)

        addrWatcher.reset();
        parsedAddresses.forEach(addr => addrWatcher.addAddress(addr));
        txWatcher.reset();
        parsedAddresses.forEach(addr => txWatcher.addAddress(addr));
      }
    });
    onNewBlock(block => {
      console.log('New block', block);
      mostRecentBlock$1 = block;
      blockStream.emit(block);
      addrWatcher.testBlock(block);
    });
    check();

    // const DHCP_PING_INTERVAL = 1000 * 60 * 10

    const DHCP_PING_INTERVAL = 1000 * 10; // 10 seconds

    let config = {};
    let address; // protocol: 'http',
    //     domain: '127.0.0.1',
    //         port: 4999,
    //             url: '/airdrop/',
    //                 dhcpUrl: '/airdrop/ping/'

    let haveRegisteredNodeManagement = false;

    const pingAirdropServer = () => {
      if (!address || !config.coin) return;
      const node = config.coin.node.airdrop;
      const url = `${node.protocol}://${node.domain}:${node.port}${node.dhcpUrl}${address}`;
      fetch(url).then(res => console.log(res));
    };

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
      });
      parentEpml.request('registerUrl', {
        url: 'send-money',
        domain: 'core',
        page: 'send-money/index.html',
        title: 'Send Money',
        icon: 'send',
        menus: [],
        parent: false
      });
      parentEpml.request('registerUrl', {
        url: 'reward-share',
        domain: 'core',
        page: 'reward-share/index.html',
        title: 'Reward share',
        icon: 'call_split',
        menus: [],
        parent: false
      });
      parentEpml.subscribe('config', c => {
        config = JSON.parse(c);
        pingAirdropServer(); // Only register node management if node management is enabled and it hasn't already been registered

        console.log("==============================");
        console.log(config);

        if (!haveRegisteredNodeManagement && config.user.knownNodes[config.user.node].enableManagement) {
          haveRegisteredNodeManagement = true;
          parentEpml.request('registerUrl', {
            url: 'node-management',
            domain: 'core',
            page: 'node-management/index.html',
            title: 'Node Management',
            icon: 'cloud',
            menus: [],
            parent: false
          });
        }
      });
      parentEpml.subscribe('selected_address', addr => {
        console.log('RECEIVED SELECTED ADDRESS STREAM');
        address = addr.address;
        pingAirdropServer();
      });
    });
    setInterval(pingAirdropServer, DHCP_PING_INTERVAL);

}));
