const express = require("express");
const bodyParser = require("body-parser");
const { Web3 } = require('web3');
const path = require('path');
const { Blockchain } = require('./components/models/Blockchain');
const { Transaction } = require('./components/models/Transaction');

const web3 = new Web3("http://localhost:8545");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let blockchain = new Blockchain();

app.post('/createTransaction', (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
    const transaction = new Transaction(fromAddress, toAddress, amount);
    blockchain.createTransaction(transaction);
    res.status(200).send("Transaction created successfully");
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
