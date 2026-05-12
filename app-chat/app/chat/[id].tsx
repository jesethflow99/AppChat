import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useChat } from '@/src/store/chat'
import type { Message } from '@/src/types'

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { getMessages, sendMessage, token, chats } = useChat()
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const flatListRef = useRef<FlatList>(null)

  const chat = chats.find(c => c.id === id)

  const loadMessages = useCallback(async () => {
    setMessages(await getMessages(id))
  }, [getMessages, id])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    const interval = setInterval(loadMessages, 2000)
    return () => clearInterval(interval)
  }, [loadMessages])

  const handleSend = () => {
    const content = text.trim()
    if (!content) return
    sendMessage(id, content)
    setText('')
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderToken === token
    return (
      <View style={[styles.messageRow, isMine ? styles.mine : styles.theirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
            {item.content}
          </Text>
          <Text style={[styles.time, isMine && styles.timeMine]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isMine && ` · ${item.status === 'sending' ? '🕐' : item.status === 'sent' ? '✓' : '✓✓'}`}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, Platform.OS !== 'web' && { paddingTop: StatusBar.currentHeight ?? 0 }]}>
      {chat && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{chat.peerName}</Text>
          <Text style={styles.headerSubtitle}>{chat.peerToken.slice(0, 12)}...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.inputBar, { paddingBottom: 8 }]}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Mensaje..."
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit
            maxLength={4096}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  mine: {
    justifyContent: 'flex-end',
  },
  theirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTextMine: {
    color: '#fff',
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
  },
})
