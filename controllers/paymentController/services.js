
const { BitcoinRPC } = require('bitcoin-rpc');

const rpc = new BitcoinRPC({
  host: 'localhost',
  port: 8332,
  user: 'username',
  password: 'password',
});

async function createMultisigTransaction(total_price, buyer_public_key, seller_public_key, platform_public_key) {
    // Calculate the commission fee
    const commission_fee = 0.05 * total_price;
  
    // Create a multisig address
    const multisig_address = await rpc.createmultisig(1, [buyer_public_key, seller_public_key, platform_public_key]);
  
    // Create the transaction
    const transaction = {
      version: 1,
      vin: [
        {
          txid: 'previous_transaction_id',
          vout: 0,
        },
      ],
      vout: [
        {
          value: total_price - commission_fee,
          scriptPubKey: {
            type: 'multisig',
            reqSigs: 2,
            pubKeys: [buyer_public_key, seller_public_key],
          },
        },
        {
          value: commission_fee,
          scriptPubKey: {
            type: 'multisig',
            reqSigs: 2,
            pubKeys: [seller_public_key, platform_public_key],
          },
        },
      ],
    };
  
    // Sign the transaction with the seller's private key
    const signed_transaction = await rpc.signrawtransactionwithkey(transaction, ['seller_private_key']);
  
    // Broadcast the transaction to the Bitcoin network
    await rpc.sendrawtransaction(signed_transaction.hex);
  
    return { multisig_address };
  
  }

  
function createMultisigAddress(buyerPubKey, sellerPubKey, escrowPubKey) {
    const publicKeys = [buyerPubKey, sellerPubKey, process.env['COMPANY_NET_PUBK']];

    const address = new bitcore.Address(publicKeys, 2); // 2 of 3 signatures required

    return address.toString();
}

async function createEscrowTransaction(multisigAddress, recipientAddress, amount, buyerKey, sellerKey) {
    const tx = new bitcore.Transaction();

    const utxos = await getUTXOs(multisigAddress);
    if (!utxos.length) {
        throw new Error("No UTXOs found for this address.");
    }

    tx.from(utxos);
    tx.to(recipientAddress, amount);
    tx.change(multisigAddress);
    tx.sign([buyerKey, sellerKey]);

    return tx;
}


module.exports = {
    createMultisigTransaction,
    createMultisigAddress,
}