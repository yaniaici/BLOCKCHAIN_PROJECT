# Blockchain Application

Welcome to the Blockchain Application! This project is a simple blockchain implementation with a user-friendly interface to interact with the blockchain.

## Features (v. LDIF)

- **Add Data to Blockchain**: Users can add data to the blockchain, which is stored in a pending state until mined.
- **Mine Data**: Mine the pending data into a new block, securing it on the blockchain with proof of work.
- **View Blockchain**: Display the entire blockchain, showing each block's index, timestamp, data, previous hash, hash, and nonce.
- **Validate Blockchain**: Validate the integrity of the blockchain to ensure no data has been tampered with.
- **User Notifications**: Informative messages for user actions, replacing alerts with in-page notifications.
- **Stylish UI**: A visually appealing interface with smooth animations and a blue gradient background.
- **Transactions**: Implement a structure of transaction that includes sender, receiver, and amount. Validate transactions to ensure data is correct and consistent.
- **Wallets and Addresses**: Generate addresses from public keys. Implement wallets that handle multiple addresses and private keys.

## Features (v. MDIF)

### Prerequisites

Make sure you have Node.js installed. You can download it from [Node.js](https://nodejs.org/).

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/blockchain-app.git
    ```

2. Navigate to the project directory:

    ```sh
    cd blockchain-app/src
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

### Running the Application

1. Start the server:

    ```sh
    node index.js
    ```

2. Open your web browser and go to `http://localhost:3000`.

## Usage

### Add Data to Blockchain

1. Enter the data you want to add in the input field under "Add Data to Blockchain".
2. Click the "Add Data" button. A success message will appear if the data is added successfully.

### Mine Pending Data

1. Click the "Mine Data" button to mine the pending data.
2. A success message will appear if the mining is successful, and the blockchain data will be refreshed.

### View Blockchain

1. Click the "Get Blockchain Data" button to view the entire blockchain.
2. The blocks will be displayed with their index, timestamp, data, previous hash, hash, and nonce.

### Validate Blockchain

1. Click the "Validate Chain" button to check the integrity of the blockchain.
2. The validation result will be displayed, indicating whether the blockchain is valid or not.

### Transactions

1. Enter the sender address, receiver address, amount, and private key in the input fields under "Add Transaction".
2. Click the "Create Transaction" button to add the transaction to the blockchain.
3. A success message will appear if the transaction is created successfully. The transaction will be included in the next mined block.

### Wallets and Addresses

1. Click the "Create Wallet" button to generate a new wallet.
2. The wallet details, including public and private keys, will be displayed.
3. You can use these keys to manage multiple addresses and private keys within the wallet.

## Personal Note

I have always wanted to create my own blockchain application, and I am taking the opportunity to learn JavaScript through this project. Any comments or suggestions are greatly appreciated!
