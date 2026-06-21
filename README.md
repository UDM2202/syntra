🧠 SYNTRA - Autonomous Intelligence Exchange (FINAL)
🚀 Overview

Syntra is an autonomous AI hedge fund system where:

🤖 AI agents generate trading intelligence
📊 A trader engine consumes signals
📡 A Bloomberg-style live feed streams all activity
💰 A wallet executes (simulated or real) trades

It behaves like a self-running hedge fund terminal powered by AI agents.

🧠 Core Concept

Syntra simulates a machine-native financial market:

3 AI Intelligence Sources:
🐋 Whale Agent → smart money flow
📰 Narrative Agent → market sentiment
📊 Derivatives Agent → leverage & funding conditions
1 Trader Agent:
collects signals
computes conviction score
makes BUY / NO BUY decision
executes trades
⚙️ System Architecture
Market Data
   ↓
AI Agents (Whale / Narrative / Derivatives)
   ↓
Signal Aggregation Engine
   ↓
Conviction Score Engine
   ↓
Trading Engine (SIM / REAL)
   ↓
PnL + Stats + Reputation
   ↓
Live Dashboard (Bloomberg Feed)
📡 Live Features
🧠 AI Trading Engine
real-time decision making
conviction scoring system
automated trade cycle
📊 Hedge Fund Dashboard
market regime (RISK-ON / RISK-OFF)
volatility tracking
liquidity monitoring
whale flow sentiment
📡 Bloomberg Feed (WebSocket)

Live events:

market updates
AI signals
trade execution
PnL updates
position closing
💰 Agent Wallet System
🔐 Wallet Address
0x31b77aE554F013A4C05629D983781bBb0dAfc03E
💳 Funding Instructions

Send BNB to activate real trading:

Minimum: 0.005 BNB
Recommended: 0.01–0.02 BNB
⚙️ Wallet Roles

The agent wallet is used for:

gas fees
real trade execution
blockchain interaction (BSC)
📊 Dashboard Balance Display
Feature	Status
Wallet Address	✅ Yes
Live Balance	⚠️ Depends on TWAK integration
Trade Execution	✅ Yes
Real PnL Tracking	⚠️ Simulated unless real mode enabled
🤖 Trading Modes
🟢 SIMULATION MODE (Default)
no real money used
safe for demo
fully functional AI logic
🔴 REAL MODE
uses funded wallet
executes real trades on BSC
requires gas (BNB)
📈 Trading Logic

Every ~2 seconds:

Step 1: Market updates

BTC / ETH / SOL move

Step 2: AI signals generated
whale
narrative
derivatives
Step 3: Decision engine
calculates conviction %
outputs BUY / NO BUY
Step 4: Execution

If BUY:

position opens
Step 5: Risk engine
Take Profit: +0.35%
Stop Loss: -0.25%
Step 6: Stats update
wins
losses
total trades
PnL
win rate
📊 Performance Engine

Tracks:

total trades
wins
losses
profit/loss
win rate %

This turns Syntra into a live hedge fund simulator.

🔐 TWAK Integration

Syntra includes a signing layer:

POST /api/twak/sign

Used for:

approving trade intents
simulating wallet authorization
audit trail generation
🖥️ How to Run
1. Install dependencies
npm install
2. Start backend
node server.cjs
3. Start frontend
npm run dev
🎮 How to Use (User Flow)
Step 1 — Open dashboard

https://syntra-one-ruby.vercel.app/

Step 2 — Start engine

Click:

▶ Start Engine
Step 3 — Watch AI trade

You will see:

AI signals (BUY / NO BUY)
live market movement
position opens/closes
PnL updates
hedge fund metrics
Step 4 — Monitor performance

Watch:

win rate
total trades
profit/loss
live Bloomberg feed
📡 Event Types (Live Feed)
Event	Meaning
market	price update
signal_buy	AI bullish signal
signal_hold	no trade
position_open	trade started
position_update	PnL update
position_close	TP/SL hit
🧠 What Makes Syntra Special
AI agents simulate financial intelligence
trader aggregates signals like hedge fund desk
live event-driven architecture
hedge fund performance tracking
optional real blockchain execution
🏆 Hackathon Value

Judges see:

autonomous AI trading loop
real-time market intelligence system
hedge fund simulation engine
WebSocket live feed (Bloomberg style)
wallet-backed execution layer
performance + analytics system
🔮 Future Upgrades
real PancakeSwap execution
AI reinforcement learning
multi-wallet investor system
copy-trading network
institutional dashboard mode
⚠️ Security
never expose private keys
use small amounts for testing
simulation mode is default safe mode
📌 Final Note

Syntra is designed to demonstrate:

“What if hedge funds were run by autonomous intelligence agents?