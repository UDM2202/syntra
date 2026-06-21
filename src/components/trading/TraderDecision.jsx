import React, { useEffect, useState } from 'react'
import AgentLogs from './AgentLogs'
import HedgeFundPanel from './HedgeFundPanel'
import { API_URL } from '../../utils/api'
import { Brain, Play, Square } from 'lucide-react'

export default function TraderDecision() {
  const [status, setStatus] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  // ======================
  // STATUS STREAM
  // ======================
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`)
      const data = await res.json()

      if (data.success) {
        setStatus(data)
        setRunning(Boolean(data.isAutoTrading || data.running))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ======================
  // WALLET
  // ======================
  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent-wallet`)
      const data = await res.json()
      if (data.success) setWallet(data)
    } catch (err) {
      console.error(err)
    }
  }

  // ======================
  // START ENGINE
  // ======================
  const start = async () => {
    setLoading(true)
    await fetch(`${API_URL}/api/start-auto-trade`, { method: 'POST' })
    await fetchStatus()
    setLoading(false)
  }

  // ======================
  // STOP ENGINE
  // ======================
  const stop = async () => {
    setLoading(true)
    await fetch(`${API_URL}/api/stop-auto-trade`, { method: 'POST' })
    await fetchStatus()
    setLoading(false)
  }

  // ======================
  // LIVE LOOP
  // ======================
  useEffect(() => {
    fetchStatus()
    fetchWallet()

    const t1 = setInterval(fetchStatus, 2000)
    const t2 = setInterval(fetchWallet, 5000)

    return () => {
      clearInterval(t1)
      clearInterval(t2)
    }
  }, [])

  const address = wallet?.address || status?.agent?.address

  return (
    <div style={{
      padding: 20,
      background: '#0B0B0F',
      borderRadius: 16,
      color: 'white',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Brain />
          <h3>Hedge Fund AI Engine</h3>
        </div>

        <button
          onClick={running ? stop : start}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: 'none',
            background: running ? '#EF4444' : '#00D4AA',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            gap: 6,
            alignItems: 'center'
          }}
        >
          {running ? <Square size={16} /> : <Play size={16} />}
          {running ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* WALLET */}
      <div style={{ marginTop: 10, color: '#aaa' }}>
        Agent Wallet: {address ? address.slice(0, 10) + '...' : 'Not connected'}
      </div>

      {/* STATUS */}
      <div style={{
        marginTop: 15,
        padding: 12,
        background: '#111827',
        borderRadius: 12
      }}>
        <div>Mode: {status?.running ? 'LIVE' : 'IDLE'}</div>
        <div>Open Position: {status?.openPosition ? 'YES' : 'NO'}</div>
        <div>Total Trades: {status?.trades?.length || 0}</div>
      </div>

      {/* PANELS */}
      <div style={{ marginTop: 20 }}>
        <AgentLogs />
      </div>

      <div style={{ marginTop: 20 }}>
        <HedgeFundPanel status={status} />
      </div>

    </div>
  )
}