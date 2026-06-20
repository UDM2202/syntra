import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useApp } from '../context/AppContext'
import { Wallet, CheckCircle, ChevronDown } from 'lucide-react'

export default function WalletConnectButton({ isMobile = false }) {
  const { address, isConnected } = useAccount()
  const { dispatch } = useApp()

  React.useEffect(() => {
    if (isConnected && address) {
      window.dispatchEvent(
        new CustomEvent('wallet-connected', {
          detail: address
        })
      )

      dispatch({
        type: 'SET_WALLET',
        payload: { connected: true, address }
      })
    } else {
      window.dispatchEvent(new CustomEvent('wallet-disconnected'))

      dispatch({
        type: 'SET_WALLET',
        payload: { connected: false, address: null }
      })
    }
  }, [isConnected, address, dispatch])

  const formatAddress = addr => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div
      style={{
        padding: isMobile ? '16px' : '24px',
        borderRadius: '20px',
        background: 'rgba(20,20,30,0.8)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted
        }) => {
          const ready = mounted
          const connected = ready && account && chain

          if (!ready) {
            return (
              <button
                type="button"
                disabled
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 600
                }}
              >
                Loading...
              </button>
            )
          }

          if (!connected) {
            return (
              <button
                type="button"
                onClick={openConnectModal}
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6C3CE1, #00D4AA)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Wallet size={18} />
                Connect Wallet
              </button>
            )
          }

          if (chain.unsupported) {
            return (
              <button
                type="button"
                onClick={openChainModal}
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'rgba(255,107,107,0.15)',
                  color: '#FF6B6B',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Wrong network
              </button>
            )
          }

          return (
            <button
              type="button"
              onClick={openAccountModal}
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.96)',
                color: '#1F2937',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={16} style={{ color: '#00D4AA' }} />
              {formatAddress(account.address || address)}
              <ChevronDown size={16} />
            </button>
          )
        }}
      </ConnectButton.Custom>

      <div
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center'
        }}
      >
        💡 Supports MetaMask, Trust Wallet, Coinbase Wallet, and more
      </div>

      {isConnected && address && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(0,212,170,0.05)',
            border: '1px solid rgba(0,212,170,0.1)',
            fontSize: '11px',
            color: '#00D4AA'
          }}
        >
          ✅ Connected: {formatAddress(address)}
        </div>
      )}
    </div>
  )
}