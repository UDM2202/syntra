import React, { useEffect, useState } from 'react'
import { API_URL } from '../../utils/api'

export default function AgentLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const ws = new WebSocket(API_URL.replace('http', 'ws'))

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)

      setLogs(prev => [msg, ...prev.slice(0, 60)])
    }

    return () => ws.close()
  }, [])

  const color = {
    market: '#6C3CE1',
    signal_buy: '#00D4AA',
    signal_hold: '#F59E0B',
    position_open: '#3B82F6',
    position_update: '#9CA3AF',
    position_close: '#EF4444',
    system: '#FFFFFF',
    twak_sign: '#8B5CF6',
trade_approved: '#00D4AA',
trade_blocked: '#EF4444'
  }

  return (
    <div style={{
      background: '#0B0B0F',
      padding: 16,
      borderRadius: 12,
      height: 320,
      overflow: 'auto',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <h3>📡 Bloomberg Feed</h3>

      {logs.map(log => (
        <div key={log.id} style={{ marginBottom: 6 }}>
          <span style={{ color: color[log.type] || '#fff' }}>
            [{log.type}]
          </span>{' '}
          {log.message}
        </div>
      ))}
    </div>
  )
}