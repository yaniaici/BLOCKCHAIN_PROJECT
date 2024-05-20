const express = require("express");
const bodyParser = require("body-parser");
const { Web3 } = require('web3');
const path = require('path');
const { Blockchain } = require('./components/models/Blockchain');

const web3 = new Web3("http://localhost:8545");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let blockchain = new Blockchain();

app.post('/addData', (req, res) => {
    const data = req.body.data; // Supongamos que los datos se envían en el cuerpo como { "data": "some data" }
    console.log(`Adding data: ${data}`);
    blockchain.addData(data);
    res.status(200).send("Data added successfully. Ready for mining.");
});

app.get('/getChain', (req, res) => {
    res.status(200).json(blockchain.chain);
});

app.post('/mineData', (req, res) => {
    const success = blockchain.minePendingData();
    if (success) {
        res.status(200).send("Data mined successfully.");
    } else {
        res.status(400).send("No data to mine.");
    }
});

app.get('/validateChain', (req, res) => {
    const isValid = blockchain.isChainValid();
    res.status(200).json({ isValid });
});
