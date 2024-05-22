import express from 'express';
import bodyParser from 'body-parser';
import Web3 from 'web3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Blockchain } from './components/models/Blockchain.js';
import { Transaction } from './components/models/Transaction.js';
import { Wallet } from './components/models/Wallet.js';

const web3 = new Web3("http://localhost:8545");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let blockchain = new Blockchain();

app.post('/createTransaction', (req, res) => {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    const wallet = Wallet.fromPrivateKey(privateKey);
    const transaction = new Transaction(fromAddress, toAddress, amount);
    wallet.signTransaction(transaction);
    try {
        blockchain.addTransaction(transaction);
        res.status(200).send("Transaction created successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post('/mineTransactions', (req, res) => {
    const { miningRewardAddress } = req.body;
    blockchain.minePendingTransactions(miningRewardAddress);
    res.status(200).send("Transactions mined successfully");
});

app.get('/getChain', (req, res) => {
    res.status(200).json(blockchain.chain);
});

app.get('/getBalance/:address', (req, res) => {
    const address = req.params.address;
    const balance = blockchain.getBalanceOfAddress(address);
    res.status(200).json({ balance });
});

app.get('/validateChain', (req, res) => {
    const isValid = blockchain.isChainValid();
    res.status(200).json({ isValid });
});

app.post('/createWallet', (req, res) => {
    const wallet = new Wallet();
    res.status(200).json({
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey
    });
});
