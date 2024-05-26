import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const web3 = new Web3('http://localhost:8545');

// Leer el ABI y bytecode del contrato compilado
const { abi, evm } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../SimpleStorage.json'), 'utf8'));

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from account:', accounts[0]);

  try {
    const gasPrice = await web3.eth.getGasPrice(); // Obtener el precio del gas actual
    console.log('Gas price:', gasPrice);

    const result = await new web3.eth.Contract(abi)
      .deploy({ data: evm.bytecode.object })
      .send({ 
        from: accounts[0], 
        gas: 1000000, 
        gasPrice 
      });

    console.log('Contract deployed to:', result.options.address);
    fs.writeFileSync(path.resolve(__dirname, '../', 'contractAddress.txt'), result.options.address);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }
};

deploy();
