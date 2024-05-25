import { Block } from "./Block.js";
import { Transaction } from "./Transaction.js";
import WebSocket from "ws";
import crypto from "crypto";

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.nodes = new Set();
    this.sockets = new Map();
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);
    this.pendingTransactions = [];

    this.broadcastChain();
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    this.pendingTransactions.push(transaction);
    this.broadcastTransaction(transaction);
    console.log("Transaction added successfully");
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  addNode(nodeUrl) {
    this.nodes.add(nodeUrl);
    this.connectToNode(nodeUrl);
  }

  connectToNode(nodeUrl) {
    if (this.sockets.has(nodeUrl)) {
      return;
    }

    const ws = new WebSocket(nodeUrl);
    ws.on('open', () => {
      console.log(`Connected to node: ${nodeUrl}`);
      this.sockets.set(nodeUrl, ws);
      ws.send(JSON.stringify({ type: 'CHAIN', chain: this.chain }));
    });

    ws.on('message', (message) => {
      const data = JSON.parse(message);
      console.log(`Received message from ${nodeUrl}`, data);
      switch (data.type) {
        case 'CHAIN':
          this.handleReceivedChain(data.chain);
          break;
        case 'TRANSACTION':
          this.handleReceivedTransaction(data.transaction);
          break;
      }
    });

    ws.on('error', (error) => {
      console.log(`Error connecting to node: ${nodeUrl}`, error);
    });

    ws.on('close', () => {
      console.log(`Connection to node closed: ${nodeUrl}`);
      this.sockets.delete(nodeUrl);
    });
  }

  broadcastChain() {
    console.log("Broadcasting chain");
    this.sockets.forEach((ws, nodeUrl) => {
      console.log(`Sending chain to node ${nodeUrl}`);
      ws.send(JSON.stringify({ type: 'CHAIN', chain: this.chain }));
    });
  }

  broadcastTransaction(transaction) {
    console.log("Broadcasting transaction");
    this.sockets.forEach((ws, nodeUrl) => {
      console.log(`Sending transaction to node ${nodeUrl}`);
      ws.send(JSON.stringify({ type: 'TRANSACTION', transaction }));
    });
  }

  handleReceivedChain(receivedChain) {
    console.log("Received chain", receivedChain);
    if (receivedChain.length > this.chain.length && this.isValidChain(receivedChain)) {
      this.chain = receivedChain;
      this.pendingTransactions = [];
    }
  }

  handleReceivedTransaction(transactionData) {
    console.log("Received transaction", transactionData);
    const transaction = new Transaction(transactionData.fromAddress, transactionData.toAddress, transactionData.amount);
    transaction.signature = transactionData.signature;
    if (transaction.isValid()) {
      this.pendingTransactions.push(transaction);
    }
  }

  isValidChain(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (
        currentBlock.hash !==
        crypto
          .createHash("sha256")
          .update(
            currentBlock.previousHash +
            currentBlock.timestamp +
            JSON.stringify(currentBlock.transactions) +
            currentBlock.nonce
          )
          .digest("hex")
      ) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

export { Blockchain };
