import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import solc from 'solc';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the contract
const contractPath = path.resolve(__dirname, '../contracts', 'SimpleStorage.sol');
// Read the contract source code
const source = fs.readFileSync(contractPath, 'utf8');

// Compile the contract
const input = {
  language: 'Solidity',
  sources: {
    'SimpleStorage.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

// Parse the compiled contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['SimpleStorage.sol'].SimpleStorage;

// Save the ABI and bytecode to a JSON file
const contractPathOutput = path.resolve(__dirname, '../', 'SimpleStorage.json');
fs.writeFileSync(contractPathOutput, JSON.stringify(contract, null, 2));

console.log('Contract compiled and saved to SimpleStorage.json');
