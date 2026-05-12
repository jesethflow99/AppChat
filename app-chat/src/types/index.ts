export interface Message {
  id: string
  chatId: string
  content: string
  senderToken: string
  timestamp: number
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface Chat {
  id: string
  peerToken: string
  peerName?: string
  lastMessage?: Message
  createdAt: number
}

export interface WSMessage {
  type: 'register' | 'message' | 'ack' | 'peer_status'
  payload: Record<string, unknown>
}
