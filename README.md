# Blockchain_Calculator_Dapp
 ### Blockchain-Powered Calculator  (Avalanche/Fuji)
A React-based calculator integrated with Avalanche blockchain to mint tokens per calculation.

 ## About the Project
This project combines React and blockchain technology, integrating a smart contract on Avalanche that mints tokens as a reward for each successful calculation. It explores tokenized incentives, Web3 authentication, and real-world blockchain applications beyond finance.

 ### Key Features

-  React-Based UI – Simple and user-friendly calculator interface
-  Blockchain-Connected – Smart contract mints tokens per calculation
-  Avalanche-Powered – Fast, low-cost transactions for seamless execution
-  Web3 Authentication – Wallet connection via MetaMask or WalletConnect
-  Scalable & Decentralized – Ideal for education, gamified learning, and DeFi apps

 ## Tech Stack
-  Frontend
-  React.js
-  ethers.js
-  Web3.js
-  CSS (Styled Components)

## Smart Contracts
- Solidity
- Hardhat
- OpenZeppelin
- Avalanche Fuji Testnet

## Backend (Optional)
- Node.js
- Express.js

 ## Installation & Setup

## Clone the Repository
``` bash
git clone https://github.com/yourusername/blockchain-calculator.git
cd blockchain-calculator //
```
### Install Dependencies

### Frontend
``` bash
cd frontend
npm install
```

### Contracts
```bash
cd ../contracts
npm install
```
### Deploy Smart Contracts
Set up a .env file with your private key and Avalanche RPC URL:

```bash
PRIVATE_KEY=your_private_key
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```
### Deploy contracts:

``` bash
npx hardhat run scripts/deploy.js --network avalancheFuji
```
## Start the Frontend
```bash
cd frontend
npm start
```
### The app will be available at http://localhost:3000.


