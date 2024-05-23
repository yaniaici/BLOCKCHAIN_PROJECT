import { Block } from "./Block.js";
import { Transaction } from "./Transaction.js";
import WebSocket from "ws";

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.nodes = new Set();
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    let block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.broadcastChain();
    this.chain.push(block);

    this.pendingTransactions = [];
    
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    this.broadcastTransaction(transaction);
    console.log("Transaction added successfully");
    this.pendingTransactions.push(transaction);
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
  }

  broadcastChain() {
    for (const node of this.nodes) {
      const ws = new WebSocket(node);
    console.log("Broadcasting chain to", node);
      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "CHAIN", chain: this.chain }));
      });
    }
  }

  broadcastTransaction(transaction) {
    for (const node of this.nodes) {
      const ws = new WebSocket(node);
      console.log("Broadcasting transaction to", node);
      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "TRANSACTION", transaction }));
      });
    }
  }

  handleReceivedChain(receivedChain) {
    if (
      receivedChain.length > this.chain.length &&
      this.isValidChain(receivedChain)
    ) {
      this.chain = receivedChain;
      this.pendingTransactions = [];
    }
  }

  handleReceivedTransaction(transactionData) {
    console.log(transactionData);
    const transaction = new Transaction(
      transactionData.fromAddress,
      transactionData.toAddress,
      transactionData.amount
    );
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
