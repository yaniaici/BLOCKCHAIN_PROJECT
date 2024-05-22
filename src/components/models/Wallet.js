import pkg from 'elliptic';
const { ec: EC } = pkg;
import { Transaction } from "./Transaction.js";

const ec = new EC("secp256k1");

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic("hex");
    this.privateKey = this.keyPair.getPrivate("hex");
  }

  signTransaction(transaction) {
    const hashTx = transaction.calculateHash();
    const sig = this.keyPair.sign(hashTx, "base64");
    transaction.signature = sig.toDER("hex");
  }

  static fromPrivateKey(privateKey) {
    const keyPair = ec.keyFromPrivate(privateKey);
    const wallet = new Wallet();
    wallet.keyPair = keyPair;
    wallet.publicKey = keyPair.getPublic("hex");
    wallet.privateKey = keyPair.getPrivate("hex");
    return wallet;
  }

  static verifySignature(transaction) {
    const publicKey = ec.keyFromPublic(transaction.fromAddress, "hex");
    return publicKey.verify(transaction.calculateHash(), transaction.signature);
  }
}

export { Wallet };

