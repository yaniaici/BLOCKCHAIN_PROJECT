const { Block } = require('./Block');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingData = [];
    }

    createGenesisBlock() {
        return new Block(Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addData(data) {
        this.pendingData.push(data);
    }

    minePendingData() {
        if (this.pendingData.length === 0) return false;

        const previousBlock = this.getLatestBlock();
        const newBlock = new Block(Date.now(), this.pendingData, previousBlock.hash);
        console.log("Mining new block...");
        console.log(`Previous Hash: ${previousBlock.hash}`);
        newBlock.mineBlock(this.difficulty);

        this.chain.push(newBlock);
        this.pendingData = [];
        return true;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            console.log(`Validating Block ${i}:`);
            console.log(`Current Hash: ${currentBlock.hash}`);
            console.log(`Calculated Hash: ${currentBlock.calculateHash()}`);
            console.log(`Previous Hash: ${currentBlock.previousHash}`);
            console.log(`Expected Previous Hash: ${previousBlock.hash}`);

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log(`Block ${i} has invalid hash`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Block ${i} has invalid previous hash`);
                return false;
            }
        }
        return true;
    }
}

module.exports = { Blockchain };
