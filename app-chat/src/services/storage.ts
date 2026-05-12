import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Chat, Message } from '@/src/types'

/* ---------- helpers ---------- */

async function loadJSON<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key)
  return raw ? JSON.parse(raw) : []
}

async function saveJSON<T>(key: string, data: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(data))
}

/* ---------- token ---------- */

export async function getMyToken(): Promise<string | null> {
  return AsyncStorage.getItem('my_token')
}

export async function setMyToken(token: string) {
  await AsyncStorage.setItem('my_token', token)
}

/* ---------- chats ---------- */

export async function getChats(): Promise<Chat[]> {
  return loadJSON<Chat>('chats')
}

async function saveChats(chats: Chat[]) {
  await saveJSON('chats', chats)
}

export async function getChatByPeerToken(peerToken: string): Promise<Chat | null> {
  const chats = await getChats()
  return chats.find(c => c.peerToken === peerToken) ?? null
}

export async function createChat(peerToken: string, peerName?: string): Promise<Chat> {
  const existing = await getChatByPeerToken(peerToken)
  if (existing) return existing

  const chat: Chat = {
    id: peerToken,
    peerToken,
    peerName: peerName ?? peerToken.slice(0, 8),
    createdAt: Date.now(),
  }
  const chats = await getChats()
  chats.unshift(chat)
  await saveChats(chats)
  return chat
}

/* ---------- messages ---------- */

export async function getMessages(chatId: string): Promise<Message[]> {
  return loadJSON<Message>(`messages:${chatId}`)
}

async function saveMessages(chatId: string, messages: Message[]) {
  await saveJSON(`messages:${chatId}`, messages)
}

export async function saveMessage(msg: Message) {
  const messages = await getMessages(msg.chatId)
  messages.push(msg)
  await saveMessages(msg.chatId, messages)

  const chats = await getChats()
  const idx = chats.findIndex(c => c.id === msg.chatId)
  if (idx !== -1) {
    chats[idx].lastMessage = msg
    const [moved] = chats.splice(idx, 1)
    chats.unshift(moved)
    await saveChats(chats)
  }
}

export async function updateMessageStatus(messageId: string, status: Message['status']) {
  const chats = await getChats()
  for (const chat of chats) {
    const messages = await getMessages(chat.id)
    const msg = messages.find(m => m.id === messageId)
    if (msg) {
      msg.status = status
      await saveMessages(chat.id, messages)
      return
    }
  }
}
