import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useChat } from '@/src/store/chat'
import type { Chat } from '@/src/types'

export default function ChatList() {
  const { chats, startChat, isConnected, token } = useChat()
  const [newPeerToken, setNewPeerToken] = useState('')

  const handleAddChat = async () => {
    const peer = newPeerToken.trim()
    if (!/^\d{10}$/.test(peer)) {
      Alert.alert('Error', 'El token debe ser un número de 10 dígitos')
      return
    }
    if (peer === token) {
      Alert.alert('Error', 'No puedes chatear contigo mismo')
      return
    }
    const chat = await startChat(peer)
    if (chat) {
      setNewPeerToken('')
      router.push(`/chat/${chat.id}`)
    }
  }

  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.peerName ?? '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.peerName}>{item.peerName ?? item.peerToken.slice(0, 8)}</Text>
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
        )}
      </View>
      {item.lastMessage && (
        <Text style={styles.timestamp}>
          {new Date(item.lastMessage.timestamp).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={[styles.dot, isConnected ? styles.online : styles.offline]} />
        <Text style={styles.statusText}>{isConnected ? 'Conectado' : 'Desconectado'}</Text>
      </View>

      <View style={styles.addChat}>
        <TextInput
          style={styles.input}
          value={newPeerToken}
          onChangeText={setNewPeerToken}
          placeholder="0000000000"
          keyboardType="number-pad"
          maxLength={10}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddChat}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChat}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay chats. Agrega un token para empezar.</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 13,
    color: '#666',
  },
  addChat: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
  },
  timestamp: {
    fontSize: 12,
    color: '#ccc',
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
})
