# PrismHealth

A privacy-preserving health data management platform built on FHEVM (Fully Homomorphic Encryption Virtual Machine). PrismHealth enables encrypted health data storage, scoring, and verification on-chain without exposing sensitive medical information.

## Features

- **Encrypted Health Data Storage**: Store health records (blood pressure, glucose, heart rate, weight) in encrypted form using FHEVM
- **Privacy-Preserving Health Scoring**: Calculate composite health scores and risk levels without decrypting sensitive data
- **On-Chain Verification**: Verify health indicators against thresholds while maintaining data privacy
- **Medication Tracking**: Track medication records with encrypted dosage information
- **Multi-Dimensional Analysis**: Analyze health across Cardiovascular, Metabolic, Exercise, and Medication dimensions

## Project Structure

```
.
├── fhevm-hardhat-template/    # Smart contracts and Hardhat configuration
│   ├── contracts/             # Solidity contracts (PrismHealth.sol, FHECounter.sol)
│   ├── deploy/                # Deployment scripts
│   ├── test/                  # Contract tests
│   └── tasks/                 # Hardhat tasks
│
└── prismhealth-frontend/      # Next.js frontend application
    ├── app/                   # Next.js app router pages
    ├── components/            # React components
    ├── hooks/                 # Custom React hooks
    ├── fhevm/                 # FHEVM integration utilities
    └── abi/                   # Contract ABIs and addresses
```

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27 with FHEVM v0.9
- **Frontend**: Next.js 16, React 19, TypeScript
- **Blockchain**: Ethereum (Sepolia testnet)
- **Encryption**: FHEVM (Fully Homomorphic Encryption)

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia ETH for gas fees

### Smart Contracts Setup

1. Navigate to the contracts directory:
   ```bash
   cd fhevm-hardhat-template
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

4. Compile contracts:
   ```bash
   npx hardhat compile
   ```

5. Run tests:
   ```bash
   npx hardhat test
   ```

6. Deploy to Sepolia:
   ```bash
   npx hardhat deploy --network sepolia --tags PrismHealth
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd prismhealth-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate contract ABIs:
   ```bash
   npm run genabi
   ```

4. Run development server (Mock mode for local testing):
   ```bash
   npm run dev:mock
   ```

5. Or run with real Relayer (requires Sepolia network):
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## Contract Addresses

### Sepolia Testnet
- **PrismHealth**: `0x6Dd39ADB3714842B6897FFb848F2874d5A2B4EDD`

### Local Hardhat Network
- **PrismHealth**: `0x6Dd39ADB3714842B6897FFb848F2874d5A2B4EDD`

## Usage

1. **Connect Wallet**: Connect your MetaMask wallet to the Sepolia testnet
2. **Enter Health Data**: Navigate to Data Entry page and input your health metrics
3. **View Analysis**: Check your health score and risk level on the Analysis page
4. **Verify Indicators**: Use the Verification page to verify health indicators against thresholds

## Development

### Running Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Static Export Check

```bash
cd prismhealth-frontend
npm run check:static
```

### Generating ABIs

After deploying contracts, regenerate ABIs:

```bash
cd prismhealth-frontend
npm run genabi
```

## License

MIT

## Acknowledgments

Built with [FHEVM](https://docs.zama.ai/protocol) by Zama.

