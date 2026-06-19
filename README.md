# 🧠 SYNTRA - Autonomous Intelligence Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![BSC](https://img.shields.io/badge/BSC-BNB%20Smart%20Chain-F0B90B?logo=binance)](https://www.bnbchain.org/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Vision](#-vision)
- [Architecture](#-architecture)
- [Core Components](#-core-components)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Trading Flow](#-trading-flow)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🚀 Overview

**Syntra** is an **autonomous intelligence exchange** where AI agents buy, sell, and trade predictive market intelligence. It creates a machine-native intelligence economy where specialized AI agents generate trading signals, a trader agent consumes and aggregates these signals, and a reputation system continuously updates trust based on outcomes.

### Key Features

- 🤖 **3 Specialized AI Agents** - Whale, Narrative, and Derivatives agents generate real-time signals
- 📊 **Real Market Data** - Powered by CoinMarketCap API (CMC)
- 🔗 **On-Chain Execution** - Real trades on BNB Smart Chain (BSC) via PancakeSwap
- 💰 **Real P&L** - Actual profit/loss from real trades, not simulations
- 🛡️ **Reputation System** - Trust scores update based on trade outcomes
- 🌐 **Multi-Wallet Support** - Connect MetaMask, Trust Wallet, Coinbase Wallet, and more
- 📱 **Responsive UI** - Works on desktop, tablet, and mobile

---

## 🌟 Vision

Financial markets today are driven by information asymmetry. Syntra introduces a new primitive:

> **Intelligence itself becomes a tradable financial asset between autonomous agents.**

Instead of one AI trying to analyze everything, Syntra creates:
- **Specialized intelligence agents**
- **A marketplace for signals**
- **A trading agent that consumes intelligence**
- **A feedback loop that rewards accuracy**

This forms the foundation of a **machine-native intelligence economy**.

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────────┐
│ SYNTRA SYSTEM │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ INTELLIGENCE PROVIDER AGENTS │ │
│ │ ┌──────────┐ ┌─────────────┐ ┌──────────────────┐ │ │
│ │ │ WHALE │ │ NARRATIVE │ │ DERIVATIVES │ │ │
│ │ │ Agent │ │ Agent │ │ Agent │ │ │
│ │ └──────────┘ └─────────────┘ └──────────────────┘ │ │
│ │ ↓ ↓ ↓ │ │
│ │ Smart Money Market Funding/Leverage │ │
│ │ Movement Narrative Conditions │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ↓ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TRADER AGENT (Consumer) │ │
│ │ • Queries all provider agents │ │
│ │ • Purchases intelligence signals │ │
│ │ • Aggregates signals → Conviction Score │ │
│ │ • Decides BUY / NO BUY │ │
│ │ • Executes trades on BSC │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ↓ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ REPUTATION ENGINE │ │
│ │ • Updates trust based on outcomes │ │
│ │ • Formula: Trust = (0.6 × Accuracy) + (0.4 × Consistency) │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ↓ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ EXECUTION LAYER │ │
│ │ • SIM mode (guaranteed working) │ │
│ │ • REAL mode (BSC + PancakeSwap) │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

text

---

## 🧩 Core Components

### 1. Intelligence Provider Agents

#### 🐋 Whale Agent
- **Purpose:** Detects "smart money" movement
- **Data Source:** CMC API (large wallet transactions, market trends)
- **Outputs:** Direction (bullish/bearish), confidence score, signal price

#### 📰 Narrative Agent
- **Purpose:** Detects market narrative strength
- **Data Source:** CMC API (sentiment, momentum, price changes)
- **Outputs:** Narrative direction, momentum score, confidence

#### 📊 Derivatives Agent
- **Purpose:** Analyzes funding and leverage conditions
- **Data Source:** CMC API (derivatives data)
- **Outputs:** Squeeze risk, market imbalance, confidence

### 2. Trader Agent (Consumer)
- **Responsibilities:**
  - Queries all provider agents
  - Compares signals
  - Purchases intelligence
  - Aggregates signals
  - Computes conviction score
  - Decides BUY / NO BUY
  - Executes simulated or real trades

### 3. Marketplace
- **Registry of intelligence providers**
- Each provider has: name, type, price, trust score, accuracy score
- Used for discovery and selection

### 4. Reputation Engine
- **Updates trust based on outcomes**
- **MVP Formula:** `Trust Score = (0.6 × Accuracy) + (0.4 × Consistency)`
- **Key rules:**
  - Updated after each trade
  - Visible in dashboard
  - Drives future selection

### 5. Execution Layer
- **Unified Interface:** `buy_intelligence()`, `execute_trade()`, `register_agent()`
- **SIM mode** (default, guaranteed working)
- **REAL mode** (optional, BSC + PancakeSwap)

---

## 🔄 How It Works

### The Demo Loop (7 Steps)
Step 1 — Generate Intelligence
3 agents produce signals
↓
Step 2 — Marketplace Display
Trader sees available signals
↓
Step 3 — Purchase Intelligence
Trader selects and "buys" signals
↓
Step 4 — Aggregate Signals
Trader computes Conviction Score
↓
Step 5 — Execute Trade
SIM or REAL execution
↓
Step 6 — Outcome Resolution
Deterministic result (for demo reliability)
↓
Step 7 — Reputation Update
Trust scores updated

text

### Trading Flow Diagram
┌─────────────────────────────────────────────────────────────────┐
│ TRADING FLOW │
├─────────────────────────────────────────────────────────────────┤
│ │
│ CMC API ──► Whale Agent ──► Signal A │
│ CMC API ──► Narrative Agent ──► Signal B │
│ CMC API ──► Derivatives Agent ──► Signal C │
│ ↓ │
│ Trader Agent │
│ ↓ │
│ Conviction Score: 76% │
│ Decision: BUY │
│ ↓ │
│ PancakeSwap (BSC) │
│ ↓ │
│ WIN / LOSS │
│ ↓ │
│ Reputation Update │
│ ↓ │
│ Repeat (autonomous) │
└─────────────────────────────────────────────────────────────────┘

text

---

## 💻 Tech Stack

### Backend (Core Engine)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime environment |
| Express | 4.x | API server |
| ethers | 5.8.0 | BSC blockchain interaction |
| dotenv | 16.x | Environment variables |
| cors | 2.x | CORS handling |

### Frontend (Dashboard)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool |
| Tailwind CSS | 4.0.0 | Styling |
| Lucide React | 0.263.1 | Icons |
| RainbowKit | 2.x | Wallet connection |
| Wagmi | 2.x | Ethereum hooks |
| Viem | 2.x | Ethereum utilities |

### Blockchain & APIs
| Service | Purpose |
|---------|---------|
| CoinMarketCap API | Market data |
| BNB Smart Chain | Trading network |
| PancakeSwap | DEX execution |
| Trust Wallet | Wallet provider |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for cloning)
- MetaMask or Trust Wallet extension (for wallet connection)

### Clone the Repository

```bash
git clone https://github.com/kirahszn/syntra.git
cd syntra
Install Dependencies
bash
npm install
Install Development Dependencies
bash
npm install -D concurrently
⚙️ Configuration
1. Create .env File
Create a .env file in the root directory:

env
# ============================================
# SYNTRA - Complete Environment Configuration
# ============================================

# --------------------------------------------
# TRUST WALLET AGENT KIT (TWAK) CREDENTIALS
# Get from: https://portal.trustwallet.com
# --------------------------------------------
TW_ACCESS_ID=your_tw_access_id_here
TW_HMAC_SECRET=your_tw_hmac_secret_here
TWAK_ACCESS_ID=your_tw_access_id_here
TWAK_HMAC_SECRET=your_tw_hmac_secret_here

# --------------------------------------------
# COINMARKETCAP (CMC) API KEY
# Get from: https://coinmarketcap.com/api/
# --------------------------------------------
CMC_API_KEY=your_cmc_api_key_here

# --------------------------------------------
# AGENT WALLET ON BSC
# Create a wallet and fund with BNB for gas
# --------------------------------------------
AGENT_ADDRESS=0xYourAgentAddressHere
AGENT_PRIVATE_KEY=your_agent_private_key_here

# --------------------------------------------
# BSC NETWORK CONFIGURATION
# --------------------------------------------
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_CHAIN_ID=56
BSC_EXPLORER=https://bscscan.com/

# --------------------------------------------
# TRADING CONFIGURATION
# Start small! Adjust these as you test
# --------------------------------------------
MAX_TRADE_AMOUNT=0.01          # Maximum BNB per trade
MIN_TRADE_AMOUNT=0.001         # Minimum BNB per trade
MAX_DAILY_TRADES=10            # Maximum trades per day
MAX_DAILY_LOSS=0.1             # Stop trading if loss exceeds this (BNB)
STOP_LOSS_PERCENT=5            # Stop loss percentage
TAKE_PROFIT_PERCENT=10         # Take profit percentage

# --------------------------------------------
# WALLETCONNECT PROJECT ID
# Get from: https://cloud.walletconnect.com/
# --------------------------------------------
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# --------------------------------------------
# SERVER CONFIGURATION
# --------------------------------------------
PORT=5000
NODE_ENV=development
2. Environment Variable Details
Variable	Description	Where to Get
TW_ACCESS_ID	Trust Wallet API access ID	Trust Wallet Developer Portal
TW_HMAC_SECRET	Trust Wallet API secret	Trust Wallet Developer Portal
CMC_API_KEY	CoinMarketCap API key	https://coinmarketcap.com/api/
AGENT_ADDRESS	Your agent wallet address	Created via TWAK or Trust Wallet
AGENT_PRIVATE_KEY	Your agent wallet private key	From wallet export
VITE_WALLETCONNECT_PROJECT_ID	WalletConnect project ID	https://cloud.walletconnect.com/
🚀 Usage
Development Mode
bash
# Start both backend and frontend
npm run dev

# Or start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
Production Build
bash
# Build for production
npm run build

# Preview production build
npm run preview
Testing
bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
Docker
bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:run
📊 Trading Flow
1. Connect Wallet
Open the app at http://localhost:3000

Click the "Wallet" tab

Click "Connect Wallet"

Select MetaMask, Trust Wallet, or another provider

Approve the connection in your wallet

2. Fund Your Agent Wallet
Get your agent address from the Wallet tab

Send BNB to this address (minimum 0.01 BNB for gas fees)

Wait for confirmation on BSC

3. Start Trading
AI Auto-Trading
Click the "AI Trading" tab

Click "Start Auto"

The AI will automatically:

Read market data from CMC

Generate signals from 3 agents

Calculate conviction scores

Execute trades on BSC

Update reputation

Manual Trading
Click the "Real Trading" tab

Enter your trade details (BUY/SELL, amount)

Click "Execute"

Confirm the transaction in your wallet

4. Monitor Performance
Stats Bar: Shows real-time balance, trades, win rate, P&L

Live Signals: View signals from all 3 agents

AI Trading: See decisions and execution results

Reputation: Track trust scores of each agent

🔒 Security
Best Practices
Never commit .env file to version control

Use separate wallet for trading (not your main wallet)

Start with small amounts ($1-5) for testing

Enable 2FA on all exchange accounts

Whitelist IP addresses for API keys

Monitor daily limits to prevent large losses

Keep private keys secure - never share them

API Key Security
bash
# .env is already in .gitignore
# Never commit it to GitHub
echo ".env" >> .gitignore
Wallet Security
Use a dedicated agent wallet

Keep minimal funds for gas fees

Withdraw profits regularly

Monitor transactions on BSCScan

🤝 Contributing
How to Contribute
Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit your changes: git commit -m 'Add some amazing feature'

Push to the branch: git push origin feature/amazing-feature

Open a Pull Request

Development Guidelines
Follow existing code style

Write meaningful commit messages

Test your changes before submitting

Update documentation accordingly

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
CoinMarketCap for market data API

Trust Wallet for wallet infrastructure

BNB Chain for blockchain support

PancakeSwap for DEX integration

WalletConnect for wallet connection

📞 Support
Issues: GitHub Issues

Discord: Join our community

Twitter: @SyntraAI

🏆 Competition Entry
This project is submitted for the BNB Hack: AI Trading Agent Edition.

Submission Requirements
✅ On-chain proof: Agent address on BSC

✅ Reproducible: Public repo with setup instructions

✅ AI tooling encouraged

✅ Works with real money

📊 Performance Metrics
Metric	Description
Win Rate	Percentage of profitable trades
Total P&L	Cumulative profit/loss in USD
Conviction Score	Confidence level of each trade
Trust Score	Agent reliability based on past performance
Daily Trades	Number of trades executed per day
🎯 Success Criteria
Syntra is successful if:

✅ In under 90 seconds, a user can see:

3 agents producing intelligence

Trader buying intelligence

Aggregated decision being formed

Trade executed

Reputation changing

✅ Users understand: "This feels like a new financial primitive."

🔮 Future Roadmap
Multi-user support - Each user connects their own wallet

Advanced AI models - Machine learning for improved signals

More data sources - Additional market indicators

Mobile app - React Native version

Social trading - Copy successful traders

Analytics dashboard - Detailed performance metrics

API for third-party integration - Open up the intelligence exchange

📚 Documentation Links
CoinMarketCap API Docs

Trust Wallet Developer Portal

BNB Chain Docs

PancakeSwap Docs

WalletConnect Docs

Built with ❤️ for the future of autonomous intelligence