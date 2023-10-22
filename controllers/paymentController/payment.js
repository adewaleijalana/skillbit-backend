const bitcoin = require("bitcoinjs-lib");
const bitcore = require('bitcore-lib');
const { BIP32Factory } = require('bip32');
const bip39 = require('bip39')
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);
const axios = require("axios");
const network = bitcoin.networks.testnet

async function getNewPublicKey() {
    // todo: we need to keep this as env variable
    const XPUB = 'tpubDDEVNmPWsSWzQJfGCdUg6uSEXeSuL14yAYs29MDYgxjDr1jz95F4K5ixvXfnXPTBLegZ5aiMx4gyfLV1VtnTr2dW2V2csZHW5F1kDfGY5ML';
    const node = bip32.fromBase58(XPUB, testnet);
    return node.derive(0).derive(0).publicKey.toString('hex');
};

async function getNewAddress() {
    // todo: we need to keep this as env variable
    const XPUB = 'tpubDDEVNmPWsSWzQJfGCdUg6uSEXeSuL14yAYs29MDYgxjDr1jz95F4K5ixvXfnXPTBLegZ5aiMx4gyfLV1VtnTr2dW2V2csZHW5F1kDfGY5ML';
    const node = bip32.fromBase58(XPUB, testnet);
    const { address } = bitcoin.payments.p2pkh({
        //to receive payments
        pubkey: node.derive(0).derive(0).publicKey,
        network: network
    });
    return address;
};

async function getNewChangeAddress() {
    // todo: we need to keep this as env variable
    const XPUB = 'tpubDDEVNmPWsSWzQJfGCdUg6uSEXeSuL14yAYs29MDYgxjDr1jz95F4K5ixvXfnXPTBLegZ5aiMx4gyfLV1VtnTr2dW2V2csZHW5F1kDfGY5ML';
    const node = bip32.fromBase58(XPUB, testnet);
    const { address } = bitcoin.payments.p2pkh({
        //to receive changes
        pubkey: node.derive(1).derive(0).publicKey,
        network: testnet
    });
    return address;
};

async function getNewChangePublicKey() {

    // todo: we need to keep this as env variable

    const XPUB = 'tpubDDEVNmPWsSWzQJfGCdUg6uSEXeSuL14yAYs29MDYgxjDr1jz95F4K5ixvXfnXPTBLegZ5aiMx4gyfLV1VtnTr2dW2V2csZHW5F1kDfGY5ML';

    const node = bip32.fromBase58(XPUB, testnet);

    return node.derive(1).derive(0).publicKey.toString('hex');

};


async function createMultisigAddress(buyerPubKey, sellerPubKey, escrowPubKey) {
    const publicKeys = [buyerPubKey, sellerPubKey, escrowPubKey].map(hex => Buffer.from(hex, 'hex'));;

    const {address} = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({
            m: 2,
            pubkeys: publicKeys,
            network: testnet
        })
    });

    return address;
}

async function getUTXOs(address) {
    try {
        const { data: utxos } = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
        return utxos;
    } catch (error) {
        console.error("Failed to fetch UTXOs:", error);
        return [];
    }
}

async function getUTXOsFromPublicKey(publicKey) {
    try {
        console.log(publicKey);
        const add = Buffer.from(publicKey, 'hex');
        const { address } = bitcoin.payments.p2pkh({
            pubkey: add,
            network: testnet
        });
        
        console.log(address);
        const { data: utxos } = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
        return utxos;
    } catch (error) {
        console.error("Failed to fetch UTXOs:", error);
        return [];
    }
}


function testAddress() {
    const path = `m/44'/0'/0'/0`

    let mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    let root = bip32.fromSeed(seed, network)

    let account = root.derivePath(path)
    let node = account.derive(0).derive(0)

    let btcAddress = bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: network,
    }).address


    console.log(`
Wallet generated: 
- Key : ${node.toWIF()},
- Mnemonic : ${mnemonic}
- Address : ${btcAddress},
- Public Key: ${node.publicKey.toString('hex')}
`)


}

module.exports = {
    getNewAddress,
    getNewChangeAddress,
    createMultisigAddress
}

// getNewPublicKey()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// getNewAddress()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// getNewChangePublicKey()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// getNewChangeAddress()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// getUTXOsFromPublicKey("03e7bbf97c93ccfcf6e575b7a1e81b59df20ea11deff732207cfc78e9df85d5de9")
//     .then(res => console.log(res))
//     .catch(err => console.log(err));


getUTXOs("2MypVWvBHzSweRF27tMr9PsCE7Gk887rzJ4")
.then(res => console.log(res))
.catch(err => console.log(err));

// testAddress();
// testAddress();

// createMultisigAddress('029e819ba74e13cf6cf4164566c4a9e0bb955b906372c138c85c13ff0497fb1623', 
// '02a7ee049b03b2e28731326e7c23b67753d2fe450b69cfb2457342f18607268091', '03bda28ab8cf2d6d2f934055377b89f2f418916e20aaea73a83b83405bed6f67b6')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));

// console.log(getPublicKey("myGNsSk7ivgCqqK6o3DY5c6dPyJFFMCG5U"));