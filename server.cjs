const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const { ethers } = require('ethers')
const WebSocket = require('ws')

dotenv.config()

const app = express()
app.use(cors({ origin: '*' }))
app.use(bodyParser.json())

// =========================
// HTTP + WS SERVER
// =========================
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

let clients = []

wss.on('connection', (ws) => {
  clients.push(ws)
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws)
  })
})

// =========================
// BLOOMBERG EVENT ENGINE
// =========================
function pushEvent(type, message, data = {}) {
  const event = {
    id: Date.now() + Math.random(),
    type,
    message,
    data,
    timestamp: Date.now()
  }

  clients.forEach(ws => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(event))
    }
  })

  console.log(`📡 [${type}] ${message}`)
}

// =========================
// CONFIG
// =========================
const PORT = process.env.PORT || 5000
const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/'
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC)

const agentWallet = process.env.AGENT_PRIVATE_KEY
  ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider)
  : null

const AGENT_ADDRESS = agentWallet?.address || null

// =========================
// STATE ENGINE
// =========================
let autoRunning = false
let openPosition = null
let tradeHistory = []
let currentDecision = null
let pendingIntents = []

// =========================
// PERFORMANCE ENGINE (NEW)
// =========================
let stats = {
  totalTrades: 0,
  wins: 0,
  losses: 0,
  pnl: 0
}

// =========================
// HEDGE METRICS ENGINE
// =========================
let hedgeMetrics = {
  regime: 'NEUTRAL',
  volatility: 'LOW',
  liquidity: 'MEDIUM',
  whaleFlow: 'NEUTRAL'
}

// =========================
// RISK ENGINE (FAST MODE)
// =========================
let risk = {
  stopLoss: 0.25,
  takeProfit: 0.35
}

// =========================
// MARKET ENGINE
// =========================
let market = {
  btc: 65000,
  eth: 3500,
  sol: 180
}

setInterval(() => {
  market.btc += (Math.random() - 0.5) * 200
  market.eth += (Math.random() - 0.5) * 30
  market.sol += (Math.random() - 0.5) * 8

  hedgeMetrics = {
    regime: market.btc > 65000 ? 'RISK-ON' : 'RISK-OFF',
    volatility: Math.random() > 0.5 ? 'HIGH' : 'LOW',
    liquidity: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
    whaleFlow: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE'
  }

  pushEvent('market', 'Market tick', { market, hedgeMetrics })
}, 2000)

// =========================
// SIGNAL ENGINE
// =========================
function signal(name) {
  const bullish = Math.random() > 0.42

  return {
    name,
    direction: bullish ? 'bullish' : 'bearish',
    confidence: Math.floor(65 + Math.random() * 30)
  }
}

// =========================
// AI EXPLANATION LAYER (NEW)
// =========================
function explainDecision(signals, decision, conviction) {
  return {
    summary:
      decision === 'BUY'
        ? 'Market conditions align for bullish entry'
        : 'Risk conditions not favorable for entry',

    factors: Object.values(signals).map(s => ({
      name: s.name,
      direction: s.direction,
      confidence: s.confidence
    })),

    conviction,
    timestamp: Date.now()
  }
}

// =========================
// DECISION ENGINE
// =========================
function generateDecision() {
  const signals = {
    whale: signal('whale'),
    narrative: signal('narrative'),
    derivatives: signal('derivatives')
  }

  const bullish = Object.values(signals).filter(s => s.direction === 'bullish').length
  const avg = Object.values(signals).reduce((a, b) => a + b.confidence, 0) / 3

  const decision = bullish >= 2 && avg > 58 ? 'BUY' : 'NO BUY'
  const conviction = Math.round((bullish / 3) * avg)

  const explanation = explainDecision(signals, decision, conviction)

  const result = {
    decision,
    conviction,
    signals,
    explanation,
    market,
    hedgeMetrics,
    timestamp: Date.now()
  }

  currentDecision = result

  pushEvent(
    decision === 'BUY' ? 'signal_buy' : 'signal_hold',
    `AI Decision: ${decision}`,
    result
  )

  return result
}

// =========================
// POSITION ENGINE
// =========================
function openTrade() {
  openPosition = {
    entryPrice: market.btc,
    entryTime: Date.now(),
    pnl: 0
  }

  pushEvent('position_open', 'Position opened', openPosition)
}

// =========================
// POSITION UPDATE (UPDATED WITH STATS)
// =========================
function updatePosition() {
  if (!openPosition) return

  const pnl = (Math.random() - 0.5) * 2
  openPosition.pnl = pnl

  pushEvent('position_update', `PnL ${pnl.toFixed(2)}%`, { pnl })

  // TP
  if (pnl > risk.takeProfit) {
    pushEvent('position_close', 'Take Profit hit')

    tradeHistory.push({ ...openPosition, reason: 'TP' })

    stats.totalTrades++
    stats.wins++
    stats.pnl += pnl

    openPosition = null
  }

  // SL
  if (pnl < -risk.stopLoss) {
    pushEvent('position_close', 'Stop Loss hit')

    tradeHistory.push({ ...openPosition, reason: 'SL' })

    stats.totalTrades++
    stats.losses++
    stats.pnl += pnl

    openPosition = null
  }
}

// =========================
// ENGINE LOOP
// =========================
function tick() {
  updatePosition()

  if (!openPosition) {
    const d = generateDecision()
    if (d.decision === 'BUY') openTrade()
  }
}

setInterval(() => {
  if (autoRunning) tick()
}, 1800)

// =========================
// TWAK SIGNING LAYER
// =========================
app.post('/api/twak/sign', (req, res) => {
  const { intent } = req.body

  if (!intent) return res.status(400).json({ success: false })

  const signedIntent = {
    ...intent,
    approved: true,
    signedAt: Date.now()
  }

  pendingIntents.push(signedIntent)

  pushEvent('twak_sign', 'TWAK approved trade intent', signedIntent)

  res.json({
    success: true,
    intent: signedIntent
  })
})

// =========================
// START / STOP
// =========================
app.post('/api/start-auto-trade', (req, res) => {
  autoRunning = true
  pushEvent('system', 'Engine Started')
  res.json({ success: true })
})

app.post('/api/stop-auto-trade', (req, res) => {
  autoRunning = false
  pushEvent('system', 'Engine Stopped')
  res.json({ success: true })
})

// =========================
// STATUS (UPDATED FOR UI)
// =========================
app.get('/api/status', (req, res) => {
  const winRate =
    stats.totalTrades > 0
      ? (stats.wins / stats.totalTrades) * 100
      : 0

  res.json({
    success: true,
    running: autoRunning,
    isAutoTrading: autoRunning,
    currentDecision,
    openPosition,
    trades: tradeHistory,
    hedgeMetrics,
    market,
    pendingIntents,

    stats: {
      ...stats,
      winRate: Number(winRate.toFixed(2))
    },

    agent: {
      address: AGENT_ADDRESS,
      configured: !!agentWallet
    }
  })
})

// =========================
server.listen(PORT, () => {
  console.log(`🚀 Syntra Hedge Fund Engine running on ${PORT}`)
  console.log(`📍 Agent: ${AGENT_ADDRESS || 'NOT SET'}`)
})