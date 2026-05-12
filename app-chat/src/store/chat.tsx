import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { Chat, Message, WSMessage } from '@/src/types'
import { wsService } from '@/src/services/websocket'
import * as storage from '@/src/services/storage'

interface ChatContextValue {
  token: string | null
  loading: boolean
  isConnected: boolean
  chats: Chat[]
  getMessages: (chatId: string) => Promise<Message[]>
  sendMessage: (chatId: string, content: string) => void
  startChat: (peerToken: string, peerName?: string) => Promise<Chat | null>
  setToken: (token: string) => void
  logout: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const tokenRef = useRef<string | null>(null)

  const loadChats = useCallback(async () => {
    setChats(await storage.getChats())
  }, [])

  useEffect(() => {
    ;(async () => {
      const saved = await storage.getMyToken()
      if (saved) {
        tokenRef.current = saved
        setTokenState(saved)
        wsService.connect(saved)
      }
      await loadChats()
      setLoading(false)
    })()

    const unsubMsg = wsService.onMessage(async (msg: WSMessage) => {
      if (msg.type === 'message') {
        const p = msg.payload as Record<string, string>
        const peerToken = p.senderToken as string
        await storage.createChat(peerToken)
        await storage.saveMessage({
          id: p.messageId as string,
          chatId: peerToken,
          content: p.content as string,
          senderToken: peerToken,
          timestamp: Number(p.timestamp),
          status: 'delivered',
        })
        await loadChats()
        wsService.send({ type: 'ack', payload: { messageId: p.messageId } })
      }
    })

    const unsubStatus = wsService.onStatus(setIsConnected)

    return () => {
      unsubMsg()
      unsubStatus()
    }
  }, [loadChats])

  const setToken = useCallback((newToken: string) => {
    storage.setMyToken(newToken).then(() => {
      tokenRef.current = newToken
      setTokenState(newToken)
      wsService.connect(newToken)
    })
  }, [])

  const logout = useCallback(() => {
    wsService.disconnect()
    tokenRef.current = null
    setTokenState(null)
    storage.setMyToken('').catch(() => {})
  }, [])

  const startChat = useCallback(async (peerToken: string, peerName?: string) => {
    if (peerToken === tokenRef.current) return null
    const chat = await storage.createChat(peerToken, peerName)
    await loadChats()
    return chat
  }, [loadChats])

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    const t = tokenRef.current
    if (!t) return

    const allChats = await storage.getChats()
    const chat = allChats.find(c => c.id === chatId)
    if (!chat) return

    const msg: Message = {
      id: `${t}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      chatId,
      content,
      senderToken: t,
      timestamp: Date.now(),
      status: 'sending',
    }

    await storage.saveMessage(msg)
    await loadChats()

    wsService.send({
      type: 'message',
      payload: {
        toToken: chat.peerToken,
        content,
        chatId,
        messageId: msg.id,
        timestamp: msg.timestamp,
      },
    })

    await storage.updateMessageStatus(msg.id, 'sent')
    await loadChats()
  }, [loadChats])

  const getMessages = useCallback(async (chatId: string) => {
    return storage.getMessages(chatId)
  }, [])

  return (
    <ChatContext.Provider value={{
      token,
      loading,
      isConnected,
      chats,
      getMessages,
      sendMessage,
      startChat,
      setToken,
      logout,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
