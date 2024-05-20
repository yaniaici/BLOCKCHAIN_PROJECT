const express = require("express");
const { Web3 } = require('web3');
const bodyParser = require("body-parser");
const path = require('path');
const { Blockchain } = require('./components/models/Blockchain');
const { Block } = require('./components/models/Block');



const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const app = express();
const PORT = 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let blockchain = new Blockchain();


app.post('/addData', (req, res) => {
    let data = req.body.data;
    let newBlock = new Block(blockchain.getLatestBlock().index + 1, new Date().toISOString(), data);
    blockchain.addBlock(newBlock);
    res.status(200).send("Data added successfully");
});

app.get('/getChain', (req, res) => {
    res.status(200).send(blockchain.chain);
});