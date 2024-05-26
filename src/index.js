import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { Blockchain } from "./components/models/Blockchain.js";
import { Transaction } from "./components/models/Transaction.js";
import { Wallet } from "./components/models/Wallet.js";
import WebSocket, { WebSocketServer } from "ws"; 
import Web3 from "web3";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const P2P_PORT = process.env.P2P_PORT || 6000;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const web3 = new Web3('http://localhost:8545');  // Inicializar Web3
const { abi } = JSON.parse(readFileSync('SimpleStorage.json', 'utf8'));
const contractAddress = readFileSync('contractAddress.txt', 'utf8').trim();
const contract = new web3.eth.Contract(abi, contractAddress);

let blockchain = new Blockchain();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`HTTP server is running on port ${PORT}`);
});

// Configure WebSocket Server
const server = new WebSocketServer({ port: P2P_PORT });
console.log(`WebSocket server is running on port ${P2P_PORT}`);

server.on('connection', (ws, req) => {
  const nodeUrl = `ws://${req.socket.remoteAddress}:${req.socket.remotePort}`;
  blockchain.sockets.set(nodeUrl, ws);
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(`Received message from ${nodeUrl}`, data);
    switch (data.type) {
      case 'CHAIN':
        blockchain.handleReceivedChain(data.chain);
        break;
      case 'TRANSACTION':
        blockchain.handleReceivedTransaction(data.transaction);
        break;
    }
  });
  ws.on('close', () => {
    console.log(`Connection to node closed: ${nodeUrl}`);
    blockchain.sockets.delete(nodeUrl);
  });
  ws.on('error', (error) => {
    console.log(`Error on connection to node: ${nodeUrl}`, error);
  });
  ws.send(JSON.stringify({ type: 'CHAIN', chain: blockchain.chain }));
});

const connectToPeers = () => {
  peers.forEach(peer => {
    blockchain.connectToNode(peer);
  });
};

connectToPeers();

// API Endpoints
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

app.post('/addNode', (req, res) => {
  const nodeUrl = req.body.nodeUrl;
  blockchain.addNode(nodeUrl);
  res.status(200).send("Node added successfully");
});
