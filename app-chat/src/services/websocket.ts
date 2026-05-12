import { Platform } from 'react-native'
import type { WSMessage } from '@/src/types'

type MessageHandler = (msg: WSMessage) => void
type StatusHandler = (connected: boolean) => void

let WS_URL: string | null = null

function getUrl(): string {
  if (WS_URL) return WS_URL

  let host = 'localhost'

  try {
    if (Platform.OS === 'web') {
      host = globalThis.location?.hostname ?? 'localhost'
    } else {
      const Constants = require('expo-constants').default
      const debugHost = Constants.expoGoConfig?.debuggerHost
      if (debugHost) {
        host = debugHost.split(':')[0]
      } else if (Platform.OS === 'android') {
        host = '10.0.2.2'
      }
    }
  } catch {}

  WS_URL = `ws://${host}:8080/ws`
  return WS_URL
}

export function setServerUrl(host: string) {
  WS_URL = `ws://${host}:8080/ws`
}

class WebSocketService {
  private ws: WebSocket | null = null
  private token: string | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private statusHandlers: Set<StatusHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private shouldReconnect = true

  connect(token: string) {
    this.token = token
    this.shouldReconnect = true
    this.reconnectAttempts = 0
    this.createConnection()
  }

  private createConnection() {
    if (!this.token) return

    this.ws = new WebSocket(getUrl())

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.send({ type: 'register', payload: { token: this.token } })
      this.statusHandlers.forEach(h => h(true))
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        this.messageHandlers.forEach(h => h(msg))
      } catch { }
    }

    this.ws.onclose = () => {
      this.statusHandlers.forEach(h => h(false))
      this.tryReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private tryReconnect() {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    setTimeout(() => this.createConnection(), this.reconnectDelay * this.reconnectAttempts)
  }

  disconnect() {
    this.shouldReconnect = false
    this.ws?.close()
    this.ws = null
    this.token = null
  }

  send(msg: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }
}

export const wsService = new WebSocketService()
