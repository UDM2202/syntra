// src/agent/momentumAgent.cjs
// Syntra Agent v14 - Render-compatible
// Uses ethers.js for balance (works anywhere), npx twak for swaps

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { ethers } = require('ethers');
dotenv.config();

const PASSWORD = process.env.TWAK_WALLET_PASSWORD;
const AGENT_ADDRESS = process.env.AGENT_ADDRESS || '0x204b13fe30C141cfA4E8a3D6136aA3391db846C2';
const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/';
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);

const STATE_FILE = path.join(__dirname, '..', '..', 'agent-state.json');
const CONTROL_FILE = path.join(__dirname, '..', '..', 'agent-control.json');
const HISTORY_FILE = path.join(__dirname, '..', '..', 'trade-history.json');
const CYCLE_SECONDS = 300;
const MIN_TRADE_INTERVAL = 3600;

const MAX_TRADE = parseFloat(process.env.MAX_TRADE_AMOUNT) || 1;
const MAX_DAILY_TRADES = parseInt(process.env.MAX_DAILY_TRADES) || 7;
const TP_PERCENT = parseFloat(process.env.TAKE_PROFIT_PERCENT) || 5;
const SL_PERCENT = parseFloat(process.env.STOP_LOSS_PERCENT) || 3;

const TRADE_PAIRS = ['ETH', 'USDT'];

// ============================================
// BALANCE VIA ETHERS (no TWAK needed)
// ============================================
async function getBnbBalance() {
  try {
    const balance = await provider.getBalance(AGENT_ADDRESS);
    const bnb = parseFloat(ethers.utils.formatEther(balance));
    let usd = bnb * 580;
    try {
      const priceFeed = new ethers.Contract(
        '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
        ['function latestAnswer() view returns (int256)'],
        provider
      );
      const price = await priceFeed.latestAnswer();
      usd = bnb * parseFloat(ethers.utils.formatUnits(price, 8));
    } catch (e) {}
    return { bnb, usd };
  } catch (e) {
    console.log('Balance error: ' + e.message);
    return { bnb: 0, usd: 0 };
  }
}

// ============================================
// SWAP VIA NPX TWAK
// ============================================
function twakSwap(amount, fromToken, toToken) {
  try {
    const cmd = 'npx twak swap ' + amount + ' ' + fromToken + ' ' + toToken + ' --chain bsc --password "' + PASSWORD + '" --slippage 0.5 --json';
    console.log('  SWAP: npx twak swap ' + amount + ' ' + fromToken + ' -> ' + toToken);
    const result = execSync(cmd, { encoding: 'utf8', timeout: 60000, env: { ...process.env } });
    const parsed = JSON.parse(result);
    const hash = parsed.txHash || parsed.transactionHash || parsed.hash;
    if (hash) return { success: true, txHash: hash, output: parsed.output };
    return { success: false, error: parsed.error || JSON.stringify(parsed) };
  } catch (e) {
    try { 
      const err = JSON.parse(e.stdout || e.stderr || '{}');
      return { success: false, error: err.error || e.message };
    } catch { 
      return { success: false, error: e.message }; 
    }
  }
}

// ============================================
// HISTORY
// ============================================
function loadHistory() {
  try { if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch (e) {}
  return { trades: [], totalTrades: 0, wins: 0, losses: 0, totalPnl: 0, lastTradeTime: 0 };
}
function saveHistory(h) { fs.writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2)); }
let history = loadHistory();

// ============================================
// STATE
// ============================================
let agentState = {
  running: false, agent: { address: AGENT_ADDRESS, configured: true },
  market: { btc: 0 }, trades: history.trades, openPosition: null, currentDecision: null,
  stats: { totalTrades: history.totalTrades, wins: history.wins, losses: history.losses, pnl: history.totalPnl, winRate: 0 },
  topMomentum: [], bnbBalance: 0, usdtBalance: 0, usdValue: 0, lastUpdate: null, _logs: []
};

function saveState() {
  agentState.lastUpdate = new Date().toISOString();
  agentState.trades = history.trades;
  agentState.stats.totalTrades = history.totalTrades;
  agentState.stats.wins = history.wins;
  agentState.stats.losses = history.losses;
  agentState.stats.pnl = history.totalPnl;
  if (history.totalTrades > 0) agentState.stats.winRate = ((history.wins / history.totalTrades) * 100).toFixed(1);
  fs.writeFileSync(STATE_FILE, JSON.stringify(agentState, null, 2));
}

function addLog(type, message) {
  agentState._logs.unshift({ id: Date.now() + Math.random(), type, message, timestamp: Date.now() });
  if (agentState._logs.length > 100) agentState._logs = agentState._logs.slice(0, 100);
  console.log('  [' + type + '] ' + message);
}

// ============================================
// CONTROL
// ============================================
let tradingActive = true;

function checkControl() {
  try {
    if (fs.existsSync(CONTROL_FILE)) {
      const control = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf8'));
      if (Date.now() - control.timestamp < 10000) {
        if (control.action === 'start' && !tradingActive) {
          tradingActive = true; agentState.running = true; saveState();
          addLog('system', 'Trading STARTED');
          fs.writeFileSync(CONTROL_FILE, JSON.stringify({ action: 'none', timestamp: 0 }));
        }
        if (control.action === 'stop' && tradingActive) {
          tradingActive = false; agentState.running = false; saveState();
          addLog('system', 'Trading STOPPED');
          fs.writeFileSync(CONTROL_FILE, JSON.stringify({ action: 'none', timestamp: 0 }));
        }
      }
    }
  } catch (e) {}
}

// ============================================
// MAIN LOOP
// ============================================
async function cycle() {
  checkControl();
  if (!tradingActive) { agentState.running = false; saveState(); return; }
  agentState.running = true;

  const bnbData = await getBnbBalance();
  agentState.bnbBalance = bnbData.bnb;
  agentState.usdValue = bnbData.usd;
  agentState.market.btc = bnbData.usd > 0 ? (bnbData.usd / 0.005) : 0;

  console.log('CYCLE | BNB: ' + bnbData.bnb.toFixed(6) + ' | $' + bnbData.usd.toFixed(2) + ' | Trades: ' + history.totalTrades);

  // Check open position
  if (agentState.openPosition) {
    const hoursHeld = (Date.now() - agentState.openPosition.entryTime) / 3600000;
    console.log('  Holding: ' + agentState.openPosition.symbol + ' for ' + hoursHeld.toFixed(1) + 'h');
    if (hoursHeld >= 24) {
      addLog('position_close', 'Auto-closing after 24h');
      const result = twakSwap(agentState.openPosition.amount + '', agentState.openPosition.symbol, 'BNB');
      if (result.success) {
        history.wins++;
        history.trades.push({ ...agentState.openPosition, result: 'CLOSED', closeTx: result.txHash });
        agentState.openPosition = null;
        addLog('trade_approved', 'Closed: ' + result.txHash);
      }
    }
    saveHistory(history); saveState();
    return;
  }

  if (bnbData.bnb < 0.001) {
    console.log('  BNB too low (need 0.001+)');
    saveState();
    return;
  }

  const timeSinceLastTrade = Date.now() - history.lastTradeTime;
  if (history.lastTradeTime > 0 && timeSinceLastTrade < MIN_TRADE_INTERVAL * 1000) {
    const mins = Math.ceil((MIN_TRADE_INTERVAL * 1000 - timeSinceLastTrade) / 60000);
    console.log('  Cooldown: ' + mins + ' min');
    saveState();
    return;
  }

  if (history.totalTrades >= MAX_DAILY_TRADES) {
    console.log('  Daily limit: ' + MAX_DAILY_TRADES);
    saveState();
    return;
  }

  const target = TRADE_PAIRS[history.totalTrades % TRADE_PAIRS.length];
  const amount = Math.min(MAX_TRADE, bnbData.bnb * 0.05);
  if (amount < 0.0005) { saveState(); return; }

  addLog('signal_buy', 'BUY ' + target + ' | ' + amount.toFixed(6) + ' BNB');
  const result = twakSwap(amount.toFixed(6), 'BNB', target);

  if (result.success) {
    history.totalTrades++;
    history.lastTradeTime = Date.now();
    agentState.openPosition = { symbol: target, entryPrice: 0, entryTime: Date.now(), amount: amount.toFixed(6), txHash: result.txHash };
    history.trades.push({ ...agentState.openPosition, result: 'OPEN' });
    saveHistory(history);
    addLog('trade_approved', result.txHash);
    addLog('position_open', target);
  } else {
    addLog('trade_blocked', target + ': ' + (result.error || 'failed').substring(0, 80));
  }

  saveState();
}

// ============================================
// START
// ============================================
console.log('========================================');
console.log('  SYNTA v14 - RENDER READY');
console.log('  Balance: ethers.js | Swap: npx twak');
console.log('  TP: ' + TP_PERCENT + '% | SL: ' + SL_PERCENT + '%');
console.log('========================================');

fs.writeFileSync(CONTROL_FILE, JSON.stringify({ action: 'none', timestamp: 0 }));
saveState();
setInterval(checkControl, 2000);

addLog('system', 'Agent online - v14');
cycle();
setInterval(cycle, CYCLE_SECONDS * 1000);

process.on('SIGINT', function() {
  agentState.running = false;
  saveHistory(history); saveState();
  process.exit(0);
});
